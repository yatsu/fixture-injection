const { fixtureObjectOrPromise, dependencyGraph } = require('../common')

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
      const fixtureDef = a => `b-${a}`

      expect(fixtureObjectOrPromise(fixtureDef, provide, ['a'])).toEqual('b-a')

      expect(provide).not.toBeCalled()
    })
  })

  describe('when fixtureDef is an asynchronous function', () => {
    describe('when `provide` is the first argument', () => {
      it('returns the result of fixtureDef() and it is a Promise', async () => {
        const provide = jest.fn().mockResolvedValue(null)

        // eslint-disable-next-line no-shadow
        const fixtureDef = async (provide) => {
          await provide('x')
        }

        const result = fixtureObjectOrPromise(fixtureDef, provide, [])
        expect(result).toBeInstanceOf(Promise)

        await result

        expect(result).resolves.toBe(undefined)

        expect(provide).toHaveBeenCalledWith('x')
      })
    })

    describe('when `provide` is the second argument', () => {
      it('returns the result of fixtureDef() and it is a Promise', async () => {
        const provide = jest.fn().mockResolvedValue(null)

        // eslint-disable-next-line no-shadow
        const fixtureDef = async (a, provide, b) => {
          await provide(`${a}-${b}-c`)
        }

        const result = fixtureObjectOrPromise(fixtureDef, provide, ['a', 'b'])
        expect(result).toBeInstanceOf(Promise)

        await result

        expect(result).resolves.toBe(undefined)

        expect(provide).toHaveBeenCalledWith('a-b-c')
      })
    })

    describe('when `provide` is the last argument', () => {
      it('returns the result of fixtureDef() and it is a Promise', async () => {
        const provide = jest.fn().mockResolvedValue(null)

        // eslint-disable-next-line no-shadow
        const fixtureDef = async (a, b, provide) => {
          await provide(`${a}-${b}-c`)
        }

        const result = fixtureObjectOrPromise(fixtureDef, provide, ['a', 'b'])
        expect(result).toBeInstanceOf(Promise)

        await result

        expect(result).resolves.toBe(undefined)

        expect(provide).toHaveBeenCalledWith('a-b-c')
      })
    })
  })
})

describe('dependencyGraph()', () => {
  it('constructs a graph from a dependency map', () => {
    const depMap = {
      a: [],
      b: [],
      c: [],
      d: ['a', 'b'],
      e: [],
      f: ['c'],
      g: ['c', 'd'],
      h: [],
      i: ['d', 'e'],
      j: ['e'],
      k: ['f', 'h'],
      l: ['h', 'j']
    }

    let graph = dependencyGraph(['a'], depMap)
    expect(graph.topologicalSort).toBeInstanceOf(Function)
    expect(graph.nodes()).toEqual(['a'])
    expect(graph.adjacent('a')).toEqual([])

    graph = dependencyGraph(['d'], depMap)
    expect(graph.nodes().sort()).toEqual(['a', 'b', 'd'])
    expect(graph.adjacent('a')).toEqual(['d'])
    expect(graph.adjacent('b')).toEqual(['d'])
    expect(graph.adjacent('d')).toEqual([])

    graph = dependencyGraph(['g'], depMap)
    expect(graph.nodes().sort()).toEqual(['a', 'b', 'c', 'd', 'g'])
    expect(graph.adjacent('a')).toEqual(['d'])
    expect(graph.adjacent('b')).toEqual(['d'])
    expect(graph.adjacent('c')).toEqual(['g'])
    expect(graph.adjacent('d')).toEqual(['g'])
    expect(graph.adjacent('g')).toEqual([])

    graph = dependencyGraph(['i', 'k', 'l'], depMap)
    expect(graph.nodes().sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'h', 'i', 'j', 'k', 'l'])
    expect(graph.adjacent('a')).toEqual(['d'])
    expect(graph.adjacent('b')).toEqual(['d'])
    expect(graph.adjacent('c')).toEqual(['f'])
    expect(graph.adjacent('d')).toEqual(['i'])
    expect(graph.adjacent('e')).toEqual(['i', 'j'])
    expect(graph.adjacent('f')).toEqual(['k'])
    expect(graph.adjacent('h')).toEqual(['k', 'l'])
    expect(graph.adjacent('i')).toEqual([])
    expect(graph.adjacent('j')).toEqual(['l'])
    expect(graph.adjacent('k')).toEqual([])
    expect(graph.adjacent('l')).toEqual([])
  })
})