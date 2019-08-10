fdescribe('test() in fdescribe()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  test('is overridden', (foo: string) => {
    expect(foo).toEqual('FOO')
  })

  test('has only() method', () => {
    expect(test.only).toBeDefined()
  })

  test('has skip() method', () => {
    expect(test.skip).toBeDefined()
  })

  test.skip('skip', () => {
    expect(true).toBe(false)
  })
})

describe('skip', () => {
  test('skip', () => {
    expect(true).toBe(false)
  })
})
