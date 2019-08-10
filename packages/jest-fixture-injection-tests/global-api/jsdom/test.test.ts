describe('test()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  test('is overridden', (foo: string) => {
    expect(foo).toEqual('FOO')
  })

  test('has only() method', () => {
    expect(test.only).toEqual(expect.any(Function))
  })

  test('has skip() method', () => {
    expect(test.skip).toEqual(expect.any(Function))
  })

  test.skip('has skip()', () => {
    expect(true).toBe(false)
  })
})
