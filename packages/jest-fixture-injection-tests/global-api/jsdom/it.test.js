describe('it()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  it('is overridden', (foo) => {
    expect(foo).toEqual('FOO')
  })

  test('has only() method', () => {
    expect(it.only).toEqual(expect.any(Function))
  })

  it('has skip() method', () => {
    expect(it.skip).toEqual(expect.any(Function))
  })

  it.skip('has skip()', () => {
    expect(true).toBe(false)
  })
})
