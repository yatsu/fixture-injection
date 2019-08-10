import { Provide, nonuse } from 'jest-fixture-injection'
import { sleep } from './helper'

export const quux = async (provide: Provide) => {
  // console.log('setup quux')
  await sleep(100)
  await provide('-QUUX-')
  // console.log('teardown quux')
  await sleep(100)
}

export const bar = async (provide: Provide, quux: string, quuux: string) => {
  nonuse(quux)
  nonuse(quuux)
  // console.log('setup bar', quux, quuux)
  await sleep(100)
  await provide('-BAR-')
  // console.log('teardown bar')
  await sleep(100)
}

export const baz = '-BAZ-'
