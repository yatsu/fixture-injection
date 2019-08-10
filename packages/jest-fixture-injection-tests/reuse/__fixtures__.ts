import { Provide } from 'jest-fixture-injection'
import nanoid from 'nanoid'

import { sleep } from './helper'

export const d = { name: 'd', id: nanoid(10) }

export const e = () => ({ name: 'e', id: nanoid(10) })

export const f = async (provide: Provide) => {
  await sleep(1)
  await provide({ name: 'f', id: nanoid(10) })
  await sleep(1)
}
