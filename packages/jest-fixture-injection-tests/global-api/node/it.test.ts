describe('it()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  it('is overridden', (foo: string) => {
    expect(foo).toEqual('FOO')
  })

  test('has only() method', () => {
    expect(it.only).toBeDefined()
  })

  it('has skip() method', () => {
    expect(it.skip).toBeDefined()
  })

  it.skip('has skip()', () => {
    expect(true).toBe(false)
  })
})
