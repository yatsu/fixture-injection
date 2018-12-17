describe('xit()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  xit('skip', (foo) => {
    expect(foo).toEqual('BAR')
  })

  it('works', (foo) => {
    // actual it case is above
    expect(foo).toEqual('FOO')
  })
})
