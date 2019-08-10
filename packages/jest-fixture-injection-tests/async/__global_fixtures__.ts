import { Provide } from 'jest-fixture-injection'

import { sleep } from './helper'

export const a = async (provide: Provide) => {
  await sleep(1)
  await provide('A()')
  await sleep(1)
}

export const b = async (provide: Provide) => {
  await sleep(1)
  await provide('B()')
  await sleep(1)
}

export const c = async (provide: Provide) => {
  await sleep(1)
  await provide('C()')
  await sleep(1)
}

export const d = async (provide: Provide, a: string, b: string) => {
  await sleep(1)
  await provide(`D(${a},${b})`)
  await sleep(1)
}

export const e = async (provide: Provide) => {
  await sleep(1)
  await provide('E()')
  await sleep(1)
}
