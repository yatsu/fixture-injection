const { fixturePromise, dependencyGraph } = require('../common')

describe('fixturePromise()', () => {
  describe('when fixtureDef is a value', () => {
    it('returns a Promise of the value', () => {
      const provide = jest.fn().mockResolvedValue(null)

      expect(fixturePromise('a', provide)).resolves.toBe('a')
      expect(fixturePromise(true, provide)).resolves.toBe(true)
      expect(fixturePromise(null, provide)).resolves.toBe(null)
      expect(fixturePromise(1.5, provide)).resolves.toBe(1.5)

      expect(provide).toHaveBeenCalledWith('a')
      expect(provide).toHaveBeenCalledWith(true)
      expect(provide).toHaveBeenCalledWith(null)
      expect(provide).toHaveBeenCalledWith(1.5)
    })
  })

  describe('when fixtureDef is a synchronous function', () => {
    it('returns a Promise of fixtureDef()', () => {
      const provide = jest.fn().mockResolvedValue(null)
      const fixtureDef = a => `b-${a}`

      expect(fixturePromise(fixtureDef, provide, ['a'])).resolves.toBe('b-a')

      expect(provide).toHaveBeenCalledWith('b-a')
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

        const result = fixturePromise(fixtureDef, provide, [])
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

        const result = fixturePromise(fixtureDef, provide, ['a', 'b'])
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

        const result = fixturePromise(fixtureDef, provide, ['a', 'b'])
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
