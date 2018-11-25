describe('Local value fixture', () => {
  describe('when it is used in a suite', () => {
    useFixture((d) => {
      this.d = d
    })

    it('allows modification', () => {
      const { d } = this
      d.foo = 1

      expect(d.name).toEqual('d')
      expect(d.id.length).toEqual(10)
      expect(d.foo).toEqual(1)
    })
  })

  describe('when it is used in a test case', () => {
    it('allows modification', (d) => {
      this.lastD = d
      d.foo = 1

      expect(d.name).toEqual('d')
      expect(d.id.length).toEqual(10)
      expect(d.foo).toEqual(1)
    })

    it('is unique in each test case', (d) => {
      expect(d).not.toBe(this.lastD) // object is not identical
      expect(d.id).toEqual(this.lastD.id) // but id is identical
      expect(d.name).toEqual('d')
      expect(d.id.length).toEqual(10)
      expect(d.foo).toBeUndefined()
    })
  })
})

describe('Local synchronous function fixture', () => {
  describe('when it is used in a suite', () => {
    useFixture((e) => {
      this.e = e
    })

    it('allows modification', () => {
      const { e } = this
      e.foo = 1

      expect(e.name).toEqual('e')
      expect(e.id.length).toEqual(10)
      expect(e.foo).toEqual(1)
    })
  })

  describe('when it is used in a test case', () => {
    it('allows modification', (e) => {
      this.lastE = e
      e.foo = 1

      expect(e.name).toEqual('e')
      expect(e.id.length).toEqual(10)
      expect(e.foo).toEqual(1)
    })

    it('is unique in each test case', (e) => {
      expect(e).not.toBe(this.lastE)
      expect(e.id).not.toEqual(this.lastE.id)
      expect(e.name).toEqual('e')
      expect(e.id.length).toEqual(10)
      expect(e.foo).toBeUndefined()
    })
  })
})

describe('Local asynchronous function fixture', () => {
  describe('when it is used in a suite', () => {
    useFixture((f) => {
      this.f = f
    })

    it('allows modification', () => {
      const { f } = this
      f.foo = 1

      expect(f.name).toEqual('f')
      expect(f.id.length).toEqual(10)
      expect(f.foo).toEqual(1)
    })
  })

  describe('when it is used in a test case', () => {
    it('allows modification', (f) => {
      this.lastF = f
      f.foo = 1

      expect(f.name).toEqual('f')
      expect(f.id.length).toEqual(10)
      expect(f.foo).toEqual(1)
    })

    it('is unique in each test case', (f) => {
      expect(f).not.toBe(this.lastF)
      expect(f.id).not.toEqual(this.lastF.id)
      expect(f.name).toEqual('f')
      expect(f.id.length).toEqual(10)
      expect(f.foo).toBeUndefined()
    })
  })
})
