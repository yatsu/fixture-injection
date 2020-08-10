import { sleep } from './helper'

jest.setTimeout(20000)

describe('Single fixture in a test case', () => {
  fixture('m', (b: string, j: string) => `M(${b},${j})`)

  test('a', (a: string) => {
    expect(a).toEqual('A()')
  })

  test('d', (d: string) => {
    expect(d).toEqual('D(A(),B())')
  })

  test('g', async (g: string) => {
    await sleep(1)

    expect(g).toEqual('G(C(),D(A(),B()))')
  })

  test('m', (m: string) => {
    expect(m).toEqual('M(B(),J(E()))')
  })
})

describe('Multiple fixtures in a test case', () => {
  test('i, k and l', (i: string, k: string, l: string) => {
    expect(i).toEqual('I(D(A(),B()),E())')
    expect(k).toEqual('K(F(C()),H())')
    expect(l).toEqual('L(H(),J(E()))')
  })
})

describe('Single fixture in a test suite', () => {
  const fixtures: { a?: string; d?: string; g?: string } = {}

  beforeAll((a: string) => {
    fixtures.a = a
  })

  beforeAll((d: string) => {
    fixtures.d = d
  })

  beforeAll(async (g: string) => {
    await sleep(1)
    fixtures.g = g
  })

  test('a, d and g', () => {
    const { a, d, g } = fixtures

    expect(a).toEqual('A()')
    expect(d).toEqual('D(A(),B())')
    expect(g).toEqual('G(C(),D(A(),B()))')
  })
})

describe('Multiple fixtures in a test suite', () => {
  const fixtures: { i?: string; k?: string; l?: string; m?: string } = {}

  fixture('m', (b: string, j: string) => `M(${b},${j})`)

  beforeAll((i, k, l, m) => {
    fixtures.i = i
    fixtures.k = k
    fixtures.l = l
    fixtures.m = m
  })

  test('i, k, l and m', () => {
    const { i, k, l, m } = fixtures

    expect(i).toEqual('I(D(A(),B()),E())')
    expect(k).toEqual('K(F(C()),H())')
    expect(l).toEqual('L(H(),J(E()))')
    expect(m).toEqual('M(B(),J(E()))')
  })
})
