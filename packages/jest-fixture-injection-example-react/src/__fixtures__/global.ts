import { Provide, nonuse } from  'jest-fixture-injection'

import { sleep } from  './helper'

export const quuux = async (provide: Provide) => {
  // console.log('setup quuux')
  await sleep(100)
  await provide('-GLOBAL-QUUUX-')
  // console.log('teardown quuux')
  await sleep(100)
}

export const foo = async (provide: Provide, quuux: string) => {
  nonuse(quuux)
  // console.log('setup foo', quuux)
  await sleep(100)
  await provide('-GLOBAL-FOO-')
  // console.log('teardown foo')
  await sleep(100)
}
