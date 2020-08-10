import type { Global } from '@jest/types'
import { FixtureInjector } from 'fixture-injection'

export const defineTestBase = (injector: FixtureInjector, ancestors: string[]) => <
  T extends Global.ItBase
>(
  fn: T
): T => {
  const testFn = injector.injectableFn(fn, ancestors.slice())
  for (const key in fn) {
    if (fn.hasOwnProperty(key)) {
      // @ts-ignore
      testFn[key] = fn[key]
    }
  }
  return testFn as T
}

export const defineTest = (injector: FixtureInjector, ancestors: string[]) => (
  fn: Global.ItConcurrent
): Global.ItConcurrent => {
  const defTestBase = defineTestBase(injector, ancestors)
  const testFn = defTestBase(fn)
  testFn.only = defTestBase(fn.only)
  testFn.skip = defTestBase(fn.skip)
  testFn.todo = fn.todo
  testFn.concurrent = fn.concurrent
  return testFn
}
