const { sleep } = require('./helper')

describe('Foo', () => {
  fixture('qux', async (provide) => {
    await provide('QUX2')
  })

  beforeAll((foo) => {
    this.foo = foo
  })

  it('Foo.bar/qux', async (bar, qux) => {
    const { foo } = this
    await sleep(100)
    console.log('Foo.bar', foo, bar, qux)
    await sleep(100)
  })

  it('Foo.baz', (baz) => {
    const { foo } = this
    console.log('Foo.baz', foo, baz)
  })

  describe('Foo.Bar', () => {
    beforeAll((bar) => {
      this.bar = bar
    })

    it('Foo.Bar.baz', (baz) => {
      const { foo, bar } = this
      console.log('Foo.Bar.baz', foo, bar, baz)
    })
  })
})

describe('Bar', () => {
  beforeAll((bar) => {
    this.bar = bar
  })

  describe('Bar.Foo', () => {
    beforeAll((foo) => {
      this.foo = foo
    })

    it('Bar.Foo.baz', (baz) => {
      const { foo, bar } = this
      console.log('Bar.Foo.baz', bar, foo, baz)
    })
  })
})

describe('Baz', () => {
  beforeAll((baz) => {
    this.baz = baz
  })

  it('Baz.bar', (bar) => {
    const { baz } = this
    console.log('Baz.bar', baz, bar)
  })

  // eslint-disable-next-line
  xit('Baz.skip', foo => {
    const { baz } = this
    console.log('Baz.skip', baz, foo)
  })
})
