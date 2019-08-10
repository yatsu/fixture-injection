import { Provide, nonuse } from 'jest-fixture-injection'

import { sleep } from './helper'

// const quuux = async (provide: Provide): Promise<void> => {
export const quuux = async (provide: Provide): Promise<void> => {
  // console.log('setup quuux')
  await sleep(100)
  await provide('-GLOBAL-QUUUX-')
  // console.log('teardown quuux')
  await sleep(100)
}

// const foo = async (provide: Provide, quuux: string): Promise<void> => {
export const foo = async (provide: Provide, quuux: string): Promise<void> => {
  nonuse(quuux)
  // console.log('setup foo', quuux)
  await sleep(100)
  await provide('-GLOBAL-FOO-')
  // console.log('teardown foo')
  await sleep(100)
}
