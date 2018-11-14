const path = require('path')
const getArguments = require('es-arguments')

class FixtureContext {
  constructor(env) {
    this.env = env
    this.map = new Map()
    this.options = {}
    this.fixtures = {}
  }

  config(opts = {}) {
    this.options = opts
  }

  load(globalFixtures, fixtures) {
    const dir = path.dirname(require.main.filename)
    this.fixtures = require(path.join(dir, fixtures)) // eslint-disable-line
  }

  useFixture(fn) {
    let finish
    this.env.beforeAll(async () => {
      finish = await this.callWithFixtures(fn)
    })
    this.env.afterAll(async () => {
      await finish()
    })
  }

  injectableRunnable(origFn) {
    return (desc, fn) => origFn(desc, async (...args) => {
      const finish = await this.callWithFixtures(fn, ...args)
      await finish()
    })
  }

  setup() {}

  teardown() {}

  async callWithFixtures(fn, ...args) {
    let finished
    const finish = new Promise((resolve) => {
      finished = resolve
    })
    const promises = []
    const fixtures = await Promise.all(
      getArguments(fn).map(
        arg => new Promise((resolve) => {
          const obj = this.initFixture(arg, (fixture) => {
            resolve(fixture)
            return finish
          })
          if (obj === undefined) {
            throw Error(`Undefined fixture '${arg}'`)
          }
          if (obj.then instanceof Function) {
            promises.push(obj)
          } else {
            resolve(obj)
          }
        })
      )
    )
    await fn(...fixtures, ...args)
    return async () => {
      finished()
      await Promise.all(promises)
    }
  }

  initFixture(name, provide) {
    const fixtureDef = this.fixtures[name]
    if (fixtureDef instanceof Function) {
      return fixtureDef(provide)
    }
    return fixtureDef
  }
}

module.exports = FixtureContext
