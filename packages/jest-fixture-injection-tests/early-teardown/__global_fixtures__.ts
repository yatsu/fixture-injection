import { Provide } from 'jest-fixture-injection'

export const a = async (provide: Provide) => {
  await provide('A()')
}

export const b = async (provide: Provide) => {
  await provide('B()')
}

export const c = async (provide: Provide) => {
  await provide('C()')
}

export const d = async (provide: Provide, a: string, b: string) => {
  await provide(`D(${a},${b})`)
}

export const e = async (provide: Provide) => {
  await provide('E()')
}
