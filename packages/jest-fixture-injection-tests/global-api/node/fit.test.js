describe('fit()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  fit('is executed exclusively', (foo) => {
    expect(foo).toEqual('FOO')
  })

  it('skip', () => {
    expect(true).toBe(false)
  })
})
