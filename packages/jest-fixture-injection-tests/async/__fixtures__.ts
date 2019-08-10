import { Provide } from 'jest-fixture-injection'

import { sleep } from './helper'

export const f = async (provide: Provide, c: string) => {
  await sleep(1)
  await provide(`F(${c})`)
  await sleep(1)
}

export const g = async (provide: Provide, c: string, d: string) => {
  await sleep(1)
  await provide(`G(${c},${d})`)
  await sleep(1)
}

export const h = async (provide: Provide) => {
  await sleep(1)
  await provide('H()')
  await sleep(1)
}

export const i = async (provide: Provide, d: string, e: string) => {
  await sleep(1)
  await provide(`I(${d},${e})`)
  await sleep(1)
}

export const j = async (provide: Provide, e: string) => {
  await sleep(1)
  await provide(`J(${e})`)
  await sleep(1)
}

export const k = async (provide: Provide, f: string, h: string) => {
  await sleep(1)
  await provide(`K(${f},${h})`)
  await sleep(1)
}

export const l = async (provide: Provide, h: string, j: string) => {
  await sleep(1)
  await provide(`L(${h},${j})`)
  await sleep(1)
}
