describe('test.skip()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  test.skip('skips', (foo: string) => {
    expect(foo).toEqual('BAR')
  })
})
