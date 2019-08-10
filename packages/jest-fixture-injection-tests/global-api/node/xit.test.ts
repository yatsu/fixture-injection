describe('xit()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  xit('skip', (foo: string) => {
    expect(foo).toEqual('BAR')
  })

  it('works', (foo: string) => {
    // actual it case is above
    expect(foo).toEqual('FOO')
  })
})
