describe('Local value fixture', () => {
  describe('when it is used in a suite', () => {
    const fixtures = {}

    useFixture((d) => {
      fixtures.d = d
    })

    test('allows modification', () => {
      const { d } = fixtures
      d.foo = 1

      expect(d.name).toEqual('d')
      expect(d.id.length).toEqual(10)
      expect(d.foo).toEqual(1)
    })
  })

  describe('when it is used in a test case', () => {
    const fixtures = {}

    test('allows modification', (d) => {
      fixtures.lastD = d
      d.foo = 1

      expect(d.name).toEqual('d')
      expect(d.id.length).toEqual(10)
      expect(d.foo).toEqual(1)
    })

    test('is unique in each test case', (d) => {
      expect(d).not.toBe(fixtures.lastD) // object is not identical
      expect(d.id).toEqual(fixtures.lastD.id) // but id is identical
      expect(d.name).toEqual('d')
      expect(d.id.length).toEqual(10)
      expect(d.foo).toBeUndefined()
    })
  })
})

describe('Local synchronous function fixture', () => {
  describe('when it is used in a suite', () => {
    const fixtures = {}

    useFixture((e) => {
      fixtures.e = e
    })

    test('allows modification', () => {
      const { e } = fixtures
      e.foo = 1

      expect(e.name).toEqual('e')
      expect(e.id.length).toEqual(10)
      expect(e.foo).toEqual(1)
    })
  })

  describe('when it is used in a test case', () => {
    const fixtures = {}

    test('allows modification', (e) => {
      fixtures.lastE = e
      e.foo = 1

      expect(e.name).toEqual('e')
      expect(e.id.length).toEqual(10)
      expect(e.foo).toEqual(1)
    })

    test('is unique in each test case', (e) => {
      expect(e).not.toBe(fixtures.lastE)
      expect(e.id).not.toEqual(fixtures.lastE.id)
      expect(e.name).toEqual('e')
      expect(e.id.length).toEqual(10)
      expect(e.foo).toBeUndefined()
    })
  })
})

describe('Local asynchronous function fixture', () => {
  describe('when it is used in a suite', () => {
    const fixtures = {}

    useFixture((f) => {
      fixtures.f = f
    })

    test('allows modification', () => {
      const { f } = fixtures
      f.foo = 1

      expect(f.name).toEqual('f')
      expect(f.id.length).toEqual(10)
      expect(f.foo).toEqual(1)
    })
  })

  describe('when it is used in a test case', () => {
    const fixtures = {}

    test('allows modification', (f) => {
      fixtures.lastF = f
      f.foo = 1

      expect(f.name).toEqual('f')
      expect(f.id.length).toEqual(10)
      expect(f.foo).toEqual(1)
    })

    test('is unique in each test case', (f) => {
      expect(f).not.toBe(fixtures.lastF)
      expect(f.id).not.toEqual(fixtures.lastF.id)
      expect(f.name).toEqual('f')
      expect(f.id.length).toEqual(10)
      expect(f.foo).toBeUndefined()
    })
  })
})
