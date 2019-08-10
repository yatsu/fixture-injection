import { Provide } from '../ts/types'
import { fixturePromise, dependencyGraph } from '../ts/common'

describe('fixturePromise()', () => {
  describe('when fixture is a value', () => {
    test('returns a Promise of the value', () => {
      const provide = jest.fn().mockResolvedValue(null)

      expect(fixturePromise('a', provide, [])).resolves.toBe('a')
      expect(fixturePromise(true, provide, [])).resolves.toBe(true)
      expect(fixturePromise(null, provide, [])).resolves.toBe(null)
      expect(fixturePromise(1.5, provide, [])).resolves.toBe(1.5)

      expect(provide).toHaveBeenCalledWith('a')
      expect(provide).toHaveBeenCalledWith(true)
      expect(provide).toHaveBeenCalledWith(null)
      expect(provide).toHaveBeenCalledWith(1.5)
    })
  })

  describe('when fixture is a synchronous function', () => {
    test('returns a Promise of fixture()', () => {
      const provide = jest.fn().mockResolvedValue(null)
      const fixture = (a: string) => `b-${a}`

      expect(fixturePromise(fixture, provide, ['a'])).resolves.toBe('b-a')

      expect(provide).toHaveBeenCalledWith('b-a')
    })
  })

  describe('when fixture is an asynchronous function', () => {
    describe('when `provide` is the first argument', () => {
      test('returns the result of fixture() and test is a Promise', async () => {
        const provide = jest.fn().mockResolvedValue(null)

        // eslint-disable-next-line no-shadow
        const fixture = async (provide: Provide) => {
          await provide('x')
        }

        const result = fixturePromise(fixture, provide, [])
        expect(result).toBeInstanceOf(Promise)

        await result

        expect(result).resolves.toBe(undefined)

        expect(provide).toHaveBeenCalledWith('x')
      })
    })

    describe('when `provide` is the second argument', () => {
      test('returns the result of fixture() and test is a Promise', async () => {
        const provide = jest.fn().mockResolvedValue(null)

        // eslint-disable-next-line no-shadow
        const fixture = async (a: string, provide: Provide, b: string) => {
          await provide(`${a}-${b}-c`)
        }

        const result = fixturePromise(fixture, provide, ['a', 'b'])
        expect(result).toBeInstanceOf(Promise)

        await result

        expect(result).resolves.toBe(undefined)

        expect(provide).toHaveBeenCalledWith('a-b-c')
      })
    })

    describe('when `provide` is the last argument', () => {
      test('returns the result of fixture() and test is a Promise', async () => {
        const provide = jest.fn().mockResolvedValue(null)

        // eslint-disable-next-line no-shadow
        const fixture = async (a: string, b: string, provide: Provide) => {
          await provide(`${a}-${b}-c`)
        }

        const result = fixturePromise(fixture, provide, ['a', 'b'])
        expect(result).toBeInstanceOf(Promise)

        await result

        expect(result).resolves.toBe(undefined)

        expect(provide).toHaveBeenCalledWith('a-b-c')
      })
    })
  })
})

describe('dependencyGraph()', () => {
  test('constructs a graph from a dependency map', () => {
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
