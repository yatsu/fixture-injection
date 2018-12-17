describe('test.only()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  test.only('is executed exclusively', (foo) => {
    expect(foo).toEqual('FOO')
  })

  test('skip', () => {
    expect(true).toBe(false)
  })
})
