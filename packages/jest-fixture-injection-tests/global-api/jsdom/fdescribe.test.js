fdescribe('test() in fdescribe()', () => {
  fixture('foo', jest.fn(() => 'FOO'))

  test('is overridden', (foo) => {
    expect(foo).toEqual('FOO')
  })

  test('has only() method', () => {
    expect(test.only).toEqual(expect.any(Function))
  })

  test('has skip() method', () => {
    expect(test.skip).toEqual(expect.any(Function))
  })

  test.skip('skip', () => {
    expect(true).toBe(false)
  })
})

describe('skip', () => {
  test('skip', () => {
    expect(true).toBe(false)
  })
})
