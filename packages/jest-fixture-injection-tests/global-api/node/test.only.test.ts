describe('test.only()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  test.only('is executed exclusively', (foo: string) => {
    expect(foo).toEqual('FOO')
  })

  test('skip', () => {
    expect(true).toBe(false)
  })
})
