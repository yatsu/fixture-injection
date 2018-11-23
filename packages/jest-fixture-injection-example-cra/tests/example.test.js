const { sleep } = require('./helper')

describe('Foo', () => {
  const fixtures = {}

  fixture('qux', async provide => {
    await provide('QUX1')
  })

  useFixture(foo => {
    fixtures.foo = foo
  })

  it('Foo.bar/qux', async (bar, qux) => {
    const { foo } = fixtures
    await sleep(100)
    console.log('Foo.bar', foo, bar, qux)
    await sleep(100)
  })

  it('Foo.baz', baz => {
    const { foo } = fixtures
    console.log('Foo.baz', foo, baz)
  })

  describe('Foo.Bar', () => {
    useFixture(bar => {
      fixtures.bar = bar
    })

    it('Foo.Bar.baz', baz => {
      const { foo, bar } = fixtures
      console.log('Foo.Bar.baz', foo, bar, baz)
    })
  })
})

describe('Bar', () => {
  const fixtures = {}

  useFixture(bar => {
    fixtures.bar = bar
  })

  describe('Bar.Foo', () => {
    useFixture(foo => {
      fixtures.foo = foo
    })

    it('Bar.Foo.baz', baz => {
      const { foo, bar } = fixtures
      console.log('Bar.Foo.baz', bar, foo, baz)
    })
  })
})

describe('Baz', () => {
  const fixtures = {}

  useFixture(baz => {
    fixtures.baz = baz
  })

  it('Baz.bar', bar => {
    const { baz } = fixtures
    console.log('Baz.bar', baz, bar)
  })

  // eslint-disable-next-line
  xit('Baz.skip', foo => {
    const { baz } = fixtures
    console.log('Baz.skip', baz, foo)
  })
})
