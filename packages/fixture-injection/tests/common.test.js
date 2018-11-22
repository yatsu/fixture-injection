const { fixtureObjectOrPromise } = require('../common')

describe('fixtureObjectOrPromise()', () => {
  describe('when fixtureDef is not a function', () => {
    it('returns the fixtureDef as the result', () => {
      const provide = jest.fn().mockResolvedValue(null)

      expect(fixtureObjectOrPromise('a', provide)).toEqual('a')
      expect(fixtureObjectOrPromise(true, provide)).toBe(true)
      expect(fixtureObjectOrPromise(null, provide)).toBe(null)
      expect(fixtureObjectOrPromise(1.5, provide)).toEqual(1.5)

      expect(provide).not.toBeCalled()
    })
  })

  describe('when fixtureDef is a synchronous function', () => {
    it('returns the result of fixtureDef()', () => {
      const provide = jest.fn().mockResolvedValue(null)

      expect(fixtureObjectOrPromise(() => 'b', provide)).toEqual('b')

      expect(provide).not.toBeCalled()
    })
  })

  describe('when fixtureDef is an asynchronous function', () => {
    it('returns the result of fixtureDef() and it is a Promise', async () => {
      const provide = jest.fn().mockResolvedValue(null)

      const fn = async (provide) => {
        await provide('c')
      }

      const result = fixtureObjectOrPromise(fn, provide)
      expect(result).toBeInstanceOf(Promise)

      await result

      expect(result).resolves.toBe(undefined)

      expect(provide).toHaveBeenCalledWith('c')
    })
  })
})
