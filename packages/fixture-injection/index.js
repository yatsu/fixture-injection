const path = require('path')
const process = require('process')
const getArguments = require('es-arguments')

class FixtureInjector {
  constructor(globalFixtureSerialization = false) {
    this.globalFixtureSerialization = globalFixtureSerialization
    this.globalFixtures = {}
    this.fixtures = {}
    this.globalFixtureObjects = null
    this.globalPromises = []
    this.finished = false
  }

  load(globalFixtures, fixtures) {
    if (path.isAbsolute(globalFixtures)) {
      this.globalFixtures = require(globalFixtures)
    } else {
      this.globalFixtures = require(path.resolve(process.cwd(), globalFixtures))
    }
    if (path.isAbsolute(fixtures)) {
      this.fixtures = require(fixtures)
    } else {
      this.fixtures = require(path.resolve(process.cwd(), fixtures))
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
    return (desc, fn) => origFn(desc, async () => {
      const finish = await this.callWithFixtures(fn)
      await finish()
    })
  }

  async setup() {
    if (!this.globalFixtureSerialization) {
      const finish = new Promise((resolve) => {
        this.finished = resolve
      })
      this.globalFixtureObjects = await Promise.all(
        Object.keys(this.globalFixtures).map(
          name => new Promise((resolve) => {
            const obj = this.initFixture(this.globalFixtures, name, (fixture) => {
              resolve(fixture)
              return finish
            })
            if (obj === undefined) {
              throw Error(`Undefined fixture '${name}'`)
            }
            if (obj.then instanceof Function) {
              this.globalPromises.push(obj)
            } else {
              resolve(obj)
            }
          })
        )
      )
    }
  }

  async teardown() {
    if (!this.globalFixtureSerialization) {
      this.finished()
      await Promise.all(this.globalPromises)
    }
  }

  async callWithFixtures(fn, ...args) {
    let finished
    const finish = new Promise((resolve) => {
      finished = resolve
    })
    const promises = []
    const fixtureObjects = await Promise.all(
      getArguments(fn).map(
        arg => new Promise((resolve) => {
          const obj = this.initFixture(this.fixtures, arg, (fixture) => {
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
    await fn(...fixtureObjects, ...args)
    return async () => {
      finished()
      await Promise.all(promises)
    }
  }

  initFixture(namespace, name, provide) {
    const fixtureDef = namespace[name]
    if (fixtureDef instanceof Function) {
      return fixtureDef(provide)
    }
    return fixtureDef
  }
}

module.exports = FixtureInjector
