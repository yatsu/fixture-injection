import { Provide } from 'jest-fixture-injection'

export const f = async (provide: Provide, c: string) => {
  await provide(`F(${c})`)
}

export const g = async (provide: Provide, c: string, d: string) => {
  await provide(`G(${c},${d})`)
}

export const h = async (provide: Provide) => {
  await provide('H()')
}

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
  await provide(`L(${h},${j})`)
}
