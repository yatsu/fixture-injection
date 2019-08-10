describe('fit()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  fit('is executed exclusively', (foo: string) => {
    expect(foo).toEqual('FOO')
  })

  it('skip', () => {
    expect(true).toBe(false)
  })
})
