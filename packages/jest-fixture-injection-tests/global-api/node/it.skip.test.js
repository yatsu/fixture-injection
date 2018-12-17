describe('it.skip()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  it.skip('skips', (foo) => {
    expect(foo).toEqual('BAR')
  })
})
