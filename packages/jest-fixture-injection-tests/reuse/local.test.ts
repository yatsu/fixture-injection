interface Obj {
  name: string
  id: string
  foo?: number
}

describe('Local value fixture', () => {
  describe('when it is used in a suite', () => {
    const fixtures: { d?: Obj } = {}

    beforeAll((d: Obj) => {
      fixtures.d = d
    })

    test('allows modification', () => {
      const { d } = fixtures
      d!.foo = 1

      expect(d!.name).toEqual('d')
      expect(d!.id.length).toEqual(10)
      expect(d!.foo).toEqual(1)
    })
  })

  describe('when it is used in a test case', () => {
    const fixtures: { lastD?: Obj } = {}

    test('allows modification', (d: Obj) => {
      fixtures.lastD = d
      d!.foo = 1

      expect(d.name).toEqual('d')
      expect(d.id.length).toEqual(10)
      expect(d.foo).toEqual(1)
    })

    test('is unique in each test case', (d: Obj) => {
      expect(d).not.toBe(fixtures.lastD) // object is not identical
      expect(d.id).toEqual(fixtures.lastD!.id) // but id is identical
      expect(d.name).toEqual('d')
      expect(d.id.length).toEqual(10)
      expect(d.foo).toBeUndefined()
    })
  })
})

describe('Local synchronous function fixture', () => {
  describe('when it is used in a suite', () => {
    const fixtures: { e?: Obj } = {}

    beforeAll((e: Obj) => {
      fixtures.e = e
    })

    test('allows modification', () => {
      const { e } = fixtures
      e!.foo = 1

      expect(e!.name).toEqual('e')
      expect(e!.id.length).toEqual(10)
      expect(e!.foo).toEqual(1)
    })
  })

  describe('when it is used in a test case', () => {
    const fixtures: { lastE?: Obj } = {}

    test('allows modification', (e: Obj) => {
      fixtures.lastE = e
      e.foo = 1

      expect(e.name).toEqual('e')
      expect(e.id.length).toEqual(10)
      expect(e.foo).toEqual(1)
    })

    test('is unique in each test case', (e: Obj) => {
      expect(e).not.toBe(fixtures.lastE)
      expect(e.id).not.toEqual(fixtures.lastE!.id)
      expect(e.name).toEqual('e')
      expect(e.id.length).toEqual(10)
      expect(e.foo).toBeUndefined()
    })
  })
})

describe('Local asynchronous function fixture', () => {
  describe('when it is used in a suite', () => {
    const fixtures: { f?: Obj } = {}

    beforeAll((f: Obj) => {
      fixtures.f = f
    })

    test('allows modification', () => {
      const { f } = fixtures
      f!.foo = 1

      expect(f!.name).toEqual('f')
      expect(f!.id.length).toEqual(10)
      expect(f!.foo).toEqual(1)
    })
  })

  describe('when it is used in a test case', () => {
    const fixtures: { lastF?: Obj } = {}

    test('allows modification', (f: Obj) => {
      fixtures.lastF = f
      f.foo = 1

      expect(f.name).toEqual('f')
      expect(f.id.length).toEqual(10)
      expect(f.foo).toEqual(1)
    })

    test('is unique in each test case', (f: Obj) => {
      expect(f).not.toBe(fixtures.lastF)
      expect(f.id).not.toEqual(fixtures.lastF!.id)
      expect(f.name).toEqual('f')
      expect(f.id.length).toEqual(10)
      expect(f.foo).toBeUndefined()
    })
  })
})
