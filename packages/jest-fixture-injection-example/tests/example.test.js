const { sleep } = require('./helper')

describe('Foo', () => {
  const fixtures = {}

  fixture('qux', async (provide) => {
    await provide('QUX1')
  })

  beforeAll((foo) => {
    fixtures.foo = foo
  })

  test('Foo.bar/qux', async (bar, qux) => {
    const { foo } = fixtures
    await sleep(100)
    console.log('Foo.bar', foo, bar, qux)
    await sleep(100)
  })

  test('Foo.baz', (baz) => {
    const { foo } = fixtures
    console.log('Foo.baz', foo, baz)
  })

  describe('Foo.Bar', () => {
    beforeAll((bar) => {
      fixtures.bar = bar
    })

    test('Foo.Bar.baz', (baz) => {
      const { foo, bar } = fixtures
      console.log('Foo.Bar.baz', foo, bar, baz)
    })
  })
})

describe('Bar', () => {
  const fixtures = {}

  beforeAll((bar) => {
    fixtures.bar = bar
  })

  describe('Bar.Foo', () => {
    beforeAll((foo) => {
      fixtures.foo = foo
    })

    test('Bar.Foo.baz', (baz) => {
      const { foo, bar } = fixtures
      console.log('Bar.Foo.baz', bar, foo, baz)
    })
  })
})

describe('Baz', () => {
  const fixtures = {}

  beforeAll((baz) => {
    fixtures.baz = baz
  })

  test('Baz.bar', (bar) => {
    const { baz } = fixtures
    console.log('Baz.bar', baz, bar)
  })

  // eslint-disable-next-line
  it.skip('Baz.skip', foo => {
    const { baz } = fixtures
    console.log('Baz.skip', baz, foo)
  })
})
