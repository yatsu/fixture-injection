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
  useFixture((a) => {
    this.a = a
  })

  useFixture((d) => {
    this.d = d
  })

  useFixture(async (g) => {
    await sleep(1)
    this.g = g
  })

  it('a, d and g', () => {
    const { a, d, g } = this

    expect(a).toEqual('A()')
    expect(d).toEqual('D(A(),B())')
    expect(g).toEqual('G(C(),D(A(),B()))')
  })
})

describe('Multiple fixtures in a test suite', () => {
  useFixture((i, k, l) => {
    this.i = i
    this.k = k
    this.l = l
  })

  it('i, k and l', () => {
    const { i, k, l } = this

    expect(i).toEqual('I(D(A(),B()),E())')
    expect(k).toEqual('K(F(C()),H())')
    expect(l).toEqual('L(H(),J(E()))')
  })
})
