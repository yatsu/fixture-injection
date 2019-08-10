import { Provide } from 'jest-fixture-injection'

import { sleep } from './helper'

export const a: string = 'A()'

export const b: () => string = () => 'B()'

export const c = async (provide: Provide) => {
  await sleep(1000)
  await provide('C()')
  await sleep(1000)
}

export const d = async (provide: Provide, a: string, b: string) => {
  await provide(`D(${a},${b})`)
}

export const e = async (provide: Provide) => {
  await provide('E()')
}
