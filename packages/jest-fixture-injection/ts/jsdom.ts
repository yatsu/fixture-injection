import process from 'process'
import vm from 'vm'

import { Config } from '@jest/types'
import createDebug from 'debug'
import { Describe, Fixture, FixtureInjector, It, nonuse } from 'fixture-injection'
import JSDOMEnvironment from 'jest-environment-jsdom'

import { FIGlobal, loadFixtures } from './common'
import { readConfig } from './config'

const debug = createDebug('jest-fixture-injection:jsdom')

export default class FIJSDOMEnvironment extends JSDOMEnvironment {
  config: Config.ProjectConfig
  ancestors: string[]
  injector: FixtureInjector | undefined

  constructor(config: Config.ProjectConfig) {
    super(config)
    debug('config: %o', config)

    this.config = config
    this.ancestors = []
  }

  async setup(): Promise<void> {
    await super.setup()

    try {
      const fixtureConfig = readConfig()
      const { fixtures, globalFixtures, ipc } = fixtureConfig
      if (!fixtures) {
        throw new Error(`There is no 'fixtures' in the fixture-injection config: ${fixtureConfig}`)
      }

      debug('loading fixtures: %s', fixtures)
      const loadedFixtures = await loadFixtures(this.config, fixtures)
      debug('loaded fixtures: %o', Object.keys(loadedFixtures))

      this.injector = new FixtureInjector(this.config.rootDir, !!globalFixtures, ipc)
      this.injector.load(undefined, loadedFixtures)
      debug('setup iniector: %o', this.injector)
      await this.injector.setup()
    } catch (err) {
      // this block is required to show error in console and exit immediately
      console.error(err)
      process.exit(1)
    }
  }

  async teardown(): Promise<void> {
    debug('teardown - injector: %o', this.injector)
    await super.teardown()
    await this.injector!.teardown()
  }

  runScript(script: vm.Script): any {
    const global = (this.global as unknown) as FIGlobal

    if (!this.dom || !global.expect) {
      // The test env is not initialized yet
      return super.runScript(script)
    }

    // Override Jest globals here
    // Jest globals: https://jestjs.io/docs/en/api
    // See also: jest-jasmine2/src/index.js
    //           jest-circus/src/index.js

    if (!global.fixture) {
      const {
        describe,
        fdescribe,
        xdescribe,
        beforeAll,
        afterAll,
        it,
        fit,
        xit,
        test,
        xtest
      } = global

      global.fixture = (name: string, fn: Fixture) =>
        this.injector!.defineFixture(name, fn, beforeAll!, afterAll!)
      global.nonuse = nonuse

      const defineDesc: (origDesc: Describe) => Describe = (origDesc: Describe) => (
        desc: string,
        fn: () => void
      ) => {
        this.ancestors.push(desc)

        global.beforeAll = (fn: () => void) =>
          this.injector!.beforeAll(fn, beforeAll!, afterAll!, this.ancestors.slice())

        const defineTest = (fn: It) => this.injector!.injectableFn(fn, this.ancestors.slice())

        global.it = defineTest(it) as jest.It
        global.it.only = defineTest(it.only) as jest.It
        global.it.skip = defineTest(it.skip) as jest.It
        global.it.todo = defineTest(it.todo) as jest.It
        global.it.concurrent = defineTest(it.concurrent) as jest.It
        global.fit = defineTest(fit) as jest.It
        global.xit = defineTest(xit) as jest.It
        global.test = defineTest(test) as jest.It
        global.test.only = defineTest(test.only) as jest.It
        global.test.skip = defineTest(test.skip) as jest.It
        global.test.todo = defineTest(test.todo) as jest.It
        global.test.concurrent = defineTest(test.concurrent) as jest.It
        global.xtest = defineTest(xtest) as jest.It

        origDesc(desc, fn)

        this.ancestors.pop()
      }

      global.describe = defineDesc(describe) as jest.Describe
      global.fdescribe = defineDesc(fdescribe) as jest.Describe
      global.xdescribe = defineDesc(xdescribe) as jest.Describe
    }

    return this.dom.runVMScript(script)
  }
}
