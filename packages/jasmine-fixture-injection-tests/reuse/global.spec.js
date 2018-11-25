describe('Global value fixture', () => {
  describe('when it is used in a suite', () => {
    useFixture((a) => {
      this.a = a
    })

    it('does not allow modification', () => {
      const { a } = this
      a.foo = 1

      expect(a.name).toEqual('a')
      expect(a.id.length).toEqual(10)
      expect(a.foo).toBeUndefined()
    })
  })

  describe('when it is used in a test case', () => {
    it('does not allow modification', (a) => {
      this.lastA = a
      a.foo = 1

      expect(a.name).toEqual('a')
      expect(a.id.length).toEqual(10)
      expect(a.foo).toBeUndefined()
    })

    it('is identical among test cases', (a) => {
      expect(a).toBe(this.lastA)
      expect(a.name).toEqual('a')
      expect(a.id.length).toEqual(10)
      expect(a.foo).toBeUndefined()
    })
  })
})

describe('Global synchronous function fixture', () => {
  describe('when it is used in a suite', () => {
    useFixture((b) => {
      this.b = b
    })

    it('does not allow modification', () => {
      const { b } = this
      b.foo = 1

      expect(b.name).toEqual('b')
      expect(b.id.length).toEqual(10)
      expect(b.foo).toBeUndefined()
    })
  })

  describe('when it is used in a test case', () => {
    it('does not allow modification', (b) => {
      this.lastB = b

      expect(b.name).toEqual('b')
      expect(b.id.length).toEqual(10)
      expect(b.foo).toBeUndefined()
    })

    it('is identical among test cases', (b) => {
      expect(b).toBe(this.lastB)
      expect(b.name).toEqual('b')
      expect(b.id.length).toEqual(10)
      expect(b.foo).toBeUndefined()
    })
  })
})

describe('Global asynchronous function fixture', () => {
  describe('when it is used in a suite', () => {
    useFixture((c) => {
      this.c = c
    })

    it('does not allow modification', () => {
      const { c } = this
      c.foo = 1

      expect(c.name).toEqual('c')
      expect(c.id.length).toEqual(10)
      expect(c.foo).toBeUndefined()
    })
  })

  describe('when it is used in a test case', () => {
    it('does not allow modification', (c) => {
      this.lastC = c

      expect(c.name).toEqual('c')
      expect(c.id.length).toEqual(10)
      expect(c.foo).toBeUndefined()
    })

    it('is identical among test cases', (c) => {
      expect(c).toBe(this.lastC)
      expect(c.name).toEqual('c')
      expect(c.id.length).toEqual(10)
      expect(c.foo).toBeUndefined()
    })
  })
})
