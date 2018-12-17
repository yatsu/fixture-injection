describe('xtest()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  xtest('skip', (foo) => {
    expect(foo).toEqual('BAR')
  })

  it('works', (foo) => {
    // actual it case is above
    expect(foo).toEqual('FOO')
  })
})
