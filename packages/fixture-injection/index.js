const path = require('path')
const getArguments = require('es-arguments')

class FixtureInjector {
  constructor() {
    this.fixtures = {}
  }

  load(globalFixtures, fixtures) {
    if (path.isAbsolute(fixtures)) {
      this.fixtures = require(fixtures)
    } else {
      this.fixtures = require(path.join(path.dirname(require.main.filename), fixtures))
    }
  }

  useFixture(fn, beforeAll, afterAll) {
    let finish
    beforeAll(async () => {
      finish = await this.callWithFixtures(fn)
    })
    afterAll(async () => {
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

module.exports = FixtureInjector
