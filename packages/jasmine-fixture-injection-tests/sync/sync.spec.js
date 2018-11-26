const { sleep } = require('./helper')

describe('Single fixture in a test case', () => {
  fixture('m', (b, j) => `M(${b},${j})`)

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

  it('m', (m) => {
    expect(m).toEqual('M(B(),J(E()))')
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
  beforeAll((a) => {
    this.a = a
  })

  beforeAll((d) => {
    this.d = d
  })

  beforeAll(async (g) => {
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
  fixture('m', (b, j) => `M(${b},${j})`)

  beforeAll((i, k, l, m) => {
    this.i = i
    this.k = k
    this.l = l
    this.m = m
  })

  it('i, k, l and m', () => {
    const {
      i, k, l, m
    } = this

    expect(i).toEqual('I(D(A(),B()),E())')
    expect(k).toEqual('K(F(C()),H())')
    expect(l).toEqual('L(H(),J(E()))')
    expect(m).toEqual('M(B(),J(E()))')
  })
})
