describe('it.only()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  it.only('is executed exclusively', (foo: string) => {
    expect(foo).toEqual('FOO')
  })

  it('skip', () => {
    expect(true).toBe(false)
  })
})
