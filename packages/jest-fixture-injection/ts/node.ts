import process from 'process'
import vm from 'vm'

import { Config, Global } from '@jest/types'
import createDebug from 'debug'
import { Fixture, FixtureInjector, nonuse } from 'fixture-injection'
import NodeEnvironment from 'jest-environment-node'

import { FIGlobal, loadFixtures } from './common'
import { readConfig } from './config'
import { defineTest, defineTestBase } from './env'

const debug = createDebug('jest-fixture-injection:node')

debug('loading node environment')

export default class FINodeEnvironment extends NodeEnvironment {
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
    debug('setup')
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

    // Set `getVmContext` undefined to let Jest call `runScript()`
    // (See: jest-runtime/src/index.ts)
    // @ts-ignore
    this.getVmContext = undefined

    debug('setup done')
  }

  async teardown(): Promise<void> {
    debug('teardown')
    await super.teardown()
    await this.injector!.teardown()
    debug('teardown done')
  }

  // TS infers the return type to be `any`, since that's what `runInContext` returns.
  runScript<T = unknown>(script: vm.Script): T | null {
    const global = (this.global as unknown) as FIGlobal

    if (!global.expect) {
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

      const context = vm.createContext({ ...global })

      context.fixture = (name: string, fn: Fixture) =>
        this.injector!.defineFixture(name, fn, beforeAll!, afterAll!)
      context.nonuse = nonuse

      const defineDesc = <T extends Global.DescribeBase>(origDesc: T): T => {
        const descFn = (desc: string, fn: () => void) => {
          this.ancestors.push(desc)

          context.beforeAll = (fn: () => void) =>
            this.injector!.beforeAll(fn, beforeAll!, afterAll!, this.ancestors.slice())

          const defTestBase = defineTestBase(this.injector!, this.ancestors)
          const defTest = defineTest(this.injector!, this.ancestors)

          context.it = defTest(it)
          context.fit = defTestBase(fit)
          context.xit = defTestBase(xit)
          context.test = defTest(test)
          context.xtest = defTestBase(xtest)

          origDesc(desc, fn)

          this.ancestors.pop()
        }
        for (const key in origDesc) {
          if (origDesc.hasOwnProperty(key)) {
            // @ts-ignore
            descFn[key] = origDesc[key]
          }
        }
        return descFn as T
      }

      context.describe = defineDesc(describe)
      context.fdescribe = defineDesc(fdescribe)
      context.xdescribe = defineDesc(xdescribe)

      this.context = context
    }

    if (this.context) {
      return script.runInContext(this.context)
    }
    return null
  }
}
