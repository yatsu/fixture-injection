describe('Teardown which is called very early (w/o any async call)', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  test('succeeds', (foo) => {
    expect(foo).toEqual('FOO')
  })
})
