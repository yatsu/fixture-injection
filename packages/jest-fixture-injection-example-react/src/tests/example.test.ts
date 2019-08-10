import 'jest-fixture-injection'
import { Provide } from 'jest-fixture-injection'

import { sleep } from './helper'

describe('Foo', () => {
  const fixtures: { foo?: string; bar?: string } = {}

  fixture('qux', async (provide: Provide) => {
    await provide('QUX1')
  })

  beforeAll((foo: string) => {
    fixtures.foo = foo
  })

  test('Foo.bar/qux', async (bar: string, qux: string) => {
    const { foo } = fixtures
    await sleep(100)
    console.log('Foo.bar', foo, bar, qux)
    await sleep(100)
  })

  test('Foo.baz', (baz: string) => {
    const { foo } = fixtures
    console.log('Foo.baz', foo, baz)
  })

  describe('Foo.Bar', () => {
    beforeAll((bar: string) => {
      fixtures.bar = bar
    })

    test('Foo.Bar.baz', (baz: string) => {
      const { foo, bar } = fixtures
      console.log('Foo.Bar.baz', foo, bar, baz)
    })
  })
})

describe('Bar', () => {
  const fixtures: { foo?: string; bar?: string } = {}

  beforeAll(bar => {
    fixtures.bar = bar
  })

  describe('Bar.Foo', () => {
    beforeAll((foo: string) => {
      fixtures.foo = foo
    })

    test('Bar.Foo.baz', (baz: string) => {
      const { foo, bar } = fixtures
      console.log('Bar.Foo.baz', bar, foo, baz)
    })
  })
})

describe('Baz', () => {
  const fixtures: { baz?: string } = {}

  beforeAll((baz: string) => {
    fixtures.baz = baz
  })

  test('Baz.bar', (bar: string) => {
    const { baz } = fixtures
    console.log('Baz.bar', baz, bar)
    expect(bar).toEqual('-BAR-')
    expect(baz).toEqual('-BAZ-')
  })

  it.skip('Baz.skip', (foo: string) => {
    const { baz } = fixtures
    console.log('Baz.skip', baz, foo)
  })
})
