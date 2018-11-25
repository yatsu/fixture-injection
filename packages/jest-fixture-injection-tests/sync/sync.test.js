const { sleep } = require('./helper')

describe('Single fixture in a test case', () => {
  fixture('m', (b, j) => `M(${b},${j})`)

  test('a', (a) => {
    expect(a).toEqual('A()')
  })

  test('d', (d) => {
    expect(d).toEqual('D(A(),B())')
  })

  test('g', async (g) => {
    await sleep(1)

    expect(g).toEqual('G(C(),D(A(),B()))')
  })

  test('m', (m) => {
    expect(m).toEqual('M(B(),J(E()))')
  })
})

describe('Multiple fixtures in a test case', () => {
  test('i, k and l', (i, k, l) => {
    expect(i).toEqual('I(D(A(),B()),E())')
    expect(k).toEqual('K(F(C()),H())')
    expect(l).toEqual('L(H(),J(E()))')
  })
})

describe('Single fixture in a test suite', () => {
  const fixtures = {}

  useFixture((a) => {
    fixtures.a = a
  })

  useFixture((d) => {
    fixtures.d = d
  })

  useFixture(async (g) => {
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
  const fixtures = {}

  fixture('m', (b, j) => `M(${b},${j})`)

  useFixture((i, k, l, m) => {
    fixtures.i = i
    fixtures.k = k
    fixtures.l = l
    fixtures.m = m
  })

  test('i, k, l and m', () => {
    const {
      i, k, l, m
    } = fixtures

    expect(i).toEqual('I(D(A(),B()),E())')
    expect(k).toEqual('K(F(C()),H())')
    expect(l).toEqual('L(H(),J(E()))')
    expect(m).toEqual('M(B(),J(E()))')
  })
})
