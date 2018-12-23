describe('suite 1', () => {
  test('test 1', () => {
    expect(true).toBe(true)
  })
})

describe('suite 2', () => {
  const fixtures = {}

  beforeAll((a, c) => {
    fixtures.a = a
    fixtures.c = c
  })

  test('test 1', (f) => {
    const { a, c } = fixtures
    expect(a).toEqual('A()')
    expect(c).toEqual('C()')
    expect(f).toEqual('F(C())')
  })
})

describe('suite 3', () => {
  test('test 1', (c, l) => {
    expect(l).toEqual('L(H(),J(E()))')
  })
})
