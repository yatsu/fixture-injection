describe('test.skip()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  test.skip('skips', (foo) => {
    expect(foo).toEqual('BAR')
  })
})
