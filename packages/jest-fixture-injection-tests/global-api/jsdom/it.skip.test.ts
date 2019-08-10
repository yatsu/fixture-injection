describe('it.skip()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  it.skip('skips', (foo: string) => {
    expect(foo).toEqual('BAR')
  })
})
