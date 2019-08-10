import process from 'process'
import vm from 'vm'

import { Config } from '@jest/types'
import createDebug from 'debug'
import { Describe, Fixture, FixtureInjector, nonuse } from 'fixture-injection'
import NodeEnvironment from 'jest-environment-node'

import { FIGlobal, loadFixtures } from './common'
import { readConfig } from './config'

const debug = createDebug('jest-fixture-injection:jsdom:debug')

export default class FINodeEnvironment extends NodeEnvironment {
  config: Config.ProjectConfig
  ancestors: string[]
  injector: FixtureInjector | undefined
  fixtureContext: vm.Context | undefined

  constructor(config: Config.ProjectConfig) {
    super(config)
    debug('config: %o', config)

    this.config = config
    this.fixtureContext = undefined
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
      await this.injector.setup()
    } catch (err) {
      // this block is required to show error in console and exit immediately
      console.error(err)
      process.exit(1)
    }
  }

  async teardown(): Promise<void> {
    await super.teardown()
    await this.injector!.teardown()
  }

  runScript(script: vm.Script): any {
    const global = (this.global as unknown) as FIGlobal

    if (!global.expect) {
      // The test env is not initialized yet
      return super.runScript(script)
    }

    // Override Jest globals here
    // Jest globals: https://jestjs.io/docs/en/api
    // See also: jest-jasmine2/src/index.js
    //           jest-circus/src/index.js

    if (!this.fixtureContext) {
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

      const context = vm.createContext({ ...global })

      context.fixture = (name: string, fn: Fixture) =>
        this.injector!.defineFixture(name, fn, beforeAll!, afterAll!)
      context.nonuse = nonuse

      const defineDesc: (origDesc: Describe) => Describe = (origDesc: Describe) => (
        desc: string,
        fn: () => void
      ) => {
        this.ancestors.push(desc)

        context.beforeAll = (fn: () => void) =>
          this.injector!.beforeAll(fn, beforeAll!, afterAll!, this.ancestors.slice())

        const defineTest = (fn: jest.It) => this.injector!.injectableFn(fn, this.ancestors.slice())

        context.test = defineTest(test)
        context.test.only = defineTest(test.only)
        context.test.skip = defineTest(test.skip)
        context.it = defineTest(it)
        context.it.only = defineTest(it.only)
        context.it.skip = defineTest(it.skip)
        context.xtest = defineTest(xtest)
        context.fit = defineTest(fit)
        context.xit = defineTest(xit)

        origDesc(desc, fn)

        this.ancestors.pop()
      }

      context.describe = defineDesc(describe)
      context.fdescribe = defineDesc(fdescribe)
      context.xdescribe = defineDesc(xdescribe)

      this.fixtureContext = context
    }

    return script.runInContext(this.fixtureContext)
  }
}
