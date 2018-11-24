const { sleep } = require('./helper')

describe('Single fixture in a test case', () => {
  it('a', (a) => {
    expect(a).toEqual('A()')
  })

  it('d', (d) => {
    expect(d).toEqual('D(A(),B())')
  })

  it('g', async (g) => {
    await sleep(1)
    expect(g).toEqual('G(C(),D(A(),B()))')
  })
})

describe('Multiple fixtures in a test case', () => {
  it('i, k and l', (i, k, l) => {
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

  it('a, d and g', () => {
    const { a, d, g } = fixtures
    expect(a).toEqual('A()')
    expect(d).toEqual('D(A(),B())')
    expect(g).toEqual('G(C(),D(A(),B()))')
  })
})

describe('Multiple fixtures in a test suite', () => {
  const fixtures = {}

  useFixture((i, k, l) => {
    fixtures.i = i
    fixtures.k = k
    fixtures.l = l
  })

  it('i, k and l', () => {
    const { i, k, l } = fixtures
    expect(i).toEqual('I(D(A(),B()),E())')
    expect(k).toEqual('K(F(C()),H())')
    expect(l).toEqual('L(H(),J(E()))')
  })
})
