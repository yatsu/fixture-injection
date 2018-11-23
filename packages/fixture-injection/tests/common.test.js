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
      const fixtureDef = jest.fn().mockReturnValue('b')

      expect(fixtureObjectOrPromise(fixtureDef, provide, ['a'])).toEqual('b')

      expect(fixtureDef).toHaveBeenCalledWith(provide, 'a')
      expect(provide).not.toBeCalled()
    })
  })

  describe('when fixtureDef is an asynchronous function', () => {
    it('returns the result of fixtureDef() and it is a Promise', async () => {
      const provide = jest.fn().mockResolvedValue(null)

      // eslint-disable-next-line no-shadow
      const fixtureDef = async (provide) => {
        await provide('c')
      }

      const result = fixtureObjectOrPromise(fixtureDef, provide, ['a', 'b'])
      expect(result).toBeInstanceOf(Promise)

      await result

      expect(result).resolves.toBe(undefined)

      expect(provide).toHaveBeenCalledWith('c')
    })
  })
})
