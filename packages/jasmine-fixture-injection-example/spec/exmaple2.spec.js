function sleep(msec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, msec)
  })
}

describe('Foo', () => {
  useFixture((gfoo, foo) => {
    this.gfoo = gfoo
    this.foo = foo
  })

  it('Foo.bar/baz', async (bar, baz) => {
    const { gfoo, foo } = this
    await sleep(100)
    console.log('Foo.bar', gfoo, foo, bar, baz)
    await sleep(100)
  })

  it('Foo.baz', (baz) => {
    const { foo } = this
    console.log('Foo.baz', foo, baz)
  })

  describe('Foo.Bar', () => {
    useFixture((bar) => {
      this.bar = bar
    })

    it('Foo.Bar.baz', (baz) => {
      const { foo, bar } = this
      console.log('Foo.Bar.baz', foo, bar, baz)
    })
  })
})

describe('Bar', () => {
  useFixture((bar) => {
    this.bar = bar
  })

  describe('Bar.Foo', () => {
    useFixture((foo) => {
      this.foo = foo
    })

    it('Bar.Foo.baz', (baz) => {
      const { foo, bar } = this
      console.log('Bar.Foo.baz', bar, foo, baz)
    })
  })
})

describe('Baz', () => {
  useFixture((baz) => {
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
