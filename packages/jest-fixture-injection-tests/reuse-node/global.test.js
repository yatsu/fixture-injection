describe('Global value fixture', () => {
  describe('when it is used in a suite', () => {
    const fixtures = {}

    beforeAll((a) => {
      fixtures.a = a
    })

    test('does not allow modification', () => {
      const { a } = fixtures
      a.foo = 1

      expect(a.name).toEqual('a')
      expect(a.id.length).toEqual(10)
      expect(a.foo).toBeUndefined()
    })
  })

  describe('when it is used in a test case', () => {
    const fixtures = {}

    test('does not allow modification', (a) => {
      fixtures.lastA = a
      a.foo = 1

      expect(a.name).toEqual('a')
      expect(a.id.length).toEqual(10)
      expect(a.foo).toBeUndefined()
    })

    test('is identical among test cases', (a) => {
      expect(a).toBe(fixtures.lastA)
      expect(a.name).toEqual('a')
      expect(a.id.length).toEqual(10)
      expect(a.foo).toBeUndefined()
    })
  })
})

describe('Global synchronous function fixture', () => {
  describe('when it is used in a suite', () => {
    const fixtures = {}

    beforeAll((b) => {
      fixtures.b = b
    })

    test('does not allow modification', () => {
      const { b } = fixtures
      b.foo = 1

      expect(b.name).toEqual('b')
      expect(b.id.length).toEqual(10)
      expect(b.foo).toBeUndefined()
    })
  })

  describe('when it is used in a test case', () => {
    const fixtures = {}

    test('does not allow modification', (b) => {
      fixtures.lastB = b

      expect(b.name).toEqual('b')
      expect(b.id.length).toEqual(10)
      expect(b.foo).toBeUndefined()
    })

    test('is identical among test cases', (b) => {
      expect(b).toBe(fixtures.lastB)
      expect(b.name).toEqual('b')
      expect(b.id.length).toEqual(10)
      expect(b.foo).toBeUndefined()
    })
  })
})

describe('Global asynchronous function fixture', () => {
  describe('when it is used in a suite', () => {
    const fixtures = {}

    beforeAll((c) => {
      fixtures.c = c
    })

    test('does not allow modification', () => {
      const { c } = fixtures
      c.foo = 1

      expect(c.name).toEqual('c')
      expect(c.id.length).toEqual(10)
      expect(c.foo).toBeUndefined()
    })
  })

  describe('when it is used in a test case', () => {
    const fixtures = {}

    test('does not allow modification', (c) => {
      fixtures.lastC = c

      expect(c.name).toEqual('c')
      expect(c.id.length).toEqual(10)
      expect(c.foo).toBeUndefined()
    })

    test('is identical among test cases', (c) => {
      expect(c).toBe(fixtures.lastC)
      expect(c.name).toEqual('c')
      expect(c.id.length).toEqual(10)
      expect(c.foo).toBeUndefined()
    })
  })
})
