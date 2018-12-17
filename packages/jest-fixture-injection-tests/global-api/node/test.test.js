describe('test()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  test('is overridden', (foo) => {
    expect(foo).toEqual('FOO')
  })

  test('has only() method', () => {
    expect(test.only).toBeDefined()
  })

  test('has skip() method', () => {
    expect(test.skip).toBeDefined()
  })

  test.skip('has skip()', () => {
    expect(true).toBe(false)
  })
})
