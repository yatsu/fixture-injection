import { Provide } from 'jest-fixture-injection'
import nanoid from 'nanoid'

import { sleep } from './helper'

export const a = { name: 'a', id: nanoid(10) }

export const b = () => ({ name: 'b', id: nanoid(10) })

export const c = async (provide: Provide) => {
  await sleep(1)
  await provide({ name: 'c', id: nanoid(10) })
  await sleep(1)
}
