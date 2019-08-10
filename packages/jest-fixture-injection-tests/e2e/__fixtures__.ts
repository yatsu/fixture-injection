import { Provide } from 'jest-fixture-injection'

import { sleep } from './helper'

export const f = async (c: string) => `F(${c})`

export const g = async (provide: Provide, c: string, d: string) => {
  await provide(`G(${c},${d})`)
}

export const h = 'H()'

export const i = async (provide: Provide, d: string, e: string) => {
  await provide(`I(${d},${e})`)
}

export const j = async (provide: Provide, e: string) => {
  await provide(`J(${e})`)
}

export const k = async (provide: Provide, f: string, h: string) => {
  await provide(`K(${f},${h})`)
}

export const l = async (provide: Provide, h: string, j: string) => {
  await sleep(1000)
  await provide(`L(${h},${j})`)
  await sleep(1000)
}
