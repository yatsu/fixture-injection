import createDebug from 'debug'
import getArguments from 'es-arguments'
import Graph from 'graph-data-structure'

import { DependencyMap, Fixture, FixtureContainer, FixtureObject, Provide } from './types'

const debug = createDebug('fixture-injection:debug')

export const IPC_SERVER_ID = 'fixture-injection-server'

export const IPC_CLIENT_ID = 'fixture-injection-client'

export const IPC_DEFAULT_OPTIONS = {
  silent: true
}

export function isObject(obj: any): obj is Object {
  return obj === Object(obj)
}

export function fixtureArguments(fixture: Fixture): string[] {
  if (typeof fixture !== 'function') {
    return []
  }
  return getArguments(fixture).filter(name => name !== 'provide')
}

function freezeOrCopy(obj: Object, freeze: boolean): Object {
  if (freeze) {
    return Object.freeze(obj)
  }
  if (isObject(obj)) {
    return { ...obj }
  }
  return obj
}

export function fixturePromise(
  fixture: Fixture,
  provide: Provide,
  dependencies: FixtureObject[],
  freeze: boolean = false,
  onSetupStart?: () => void,
  onSetupEnd?: () => void,
  onTeardownStart?: () => void,
  onTeardownEnd?: () => void
): Promise<FixtureObject> {
  if (onSetupStart) onSetupStart()

  if (typeof fixture === 'function') {
    const provideWithLogging = (fixture: string) => {
      if (onSetupEnd) onSetupEnd()
      const fnFinish = provide(fixture)
      fnFinish
        .then(() => {
          if (onTeardownStart) onTeardownStart()
        })
        .catch(err => {
          throw err
        })
      return fnFinish
    }
    const index = getArguments(fixture).indexOf('provide')
    const fixtureResult =
      index < 0
        ? fixture(...dependencies)
        : fixture(...dependencies.slice(0, index), provideWithLogging, ...dependencies.slice(index))

    if (typeof fixtureResult.then === 'function') {
      if (index < 0) {
        return new Promise((resolve, reject) => {
          fixtureResult
            .then((fixtureResult: FixtureObject) => {
              provideWithLogging(fixtureResult)
                .then(() => {
                  if (onTeardownEnd) onTeardownEnd()
                  resolve()
                })
                .catch(err => reject(err))
            })
            .catch((err: any) => reject(err))
        })
      }
      return new Promise((resolve, reject) => {
        fixtureResult
          .then(() => {
            if (onTeardownEnd) onTeardownEnd()
            resolve()
          })
          .catch((err: any) => reject(err))
      })
    } else {
      // typeof fixtureResult.then !== 'function'
      if (onSetupEnd) onSetupEnd()

      const fixtureObject = freezeOrCopy(fixtureResult, freeze)
      return new Promise((resolve, reject) => {
        provide(fixtureObject)
          .then(() => {
            if (onTeardownStart) onTeardownStart()
            if (onTeardownEnd) onTeardownEnd()
            resolve(fixtureObject)
          })
          .catch(err => reject(err))
      })
    }
  } else {
    // typeof fixture !== 'function'
    if (onSetupEnd) onSetupEnd()

    const fixtureObject = freezeOrCopy(fixture, freeze)
    return new Promise((resolve, reject) => {
      provide(fixtureObject)
        .then(() => {
          if (onTeardownStart) onTeardownStart()
          if (onTeardownEnd) onTeardownEnd()
          resolve(fixtureObject)
        })
        .catch(err => reject(err))
    })
  }
}

export function constructDependencyMap(fixtures: Record<string, Fixture>): DependencyMap {
  return Object.keys(fixtures).reduce(
    (acc, name) => ({
      ...acc,
      [name]: fixtureArguments(fixtures[name])
    }),
    {}
  )
}

export function dependencyGraph(fixtureNames: string[], dependencyMap: DependencyMap): Graph {
  const graph = new Graph()
  const constructGraph = (name: string) => {
    graph.addNode(name)
    const depMap = dependencyMap[name] || []
    depMap.forEach((dep: string) => {
      constructGraph(dep)
      graph.addEdge(dep, name)
    })
  }
  fixtureNames.forEach(constructGraph)
  return graph
}

export async function fixtureObjects(
  fixtureNames: string[],
  dependencyMap: DependencyMap,
  constructFixturePromise: (fname: string, dependenciesPromise: Promise<FixtureContainer[]>) => any
): Promise<FixtureObject[]> {
  const fixturePromises: Record<string, Promise<any>> = {}
  const graph = dependencyGraph(fixtureNames, dependencyMap)
  graph.topologicalSort().forEach((fname: string) => {
    const depMap = dependencyMap[fname] || []
    const dependenciesPromise = Promise.all(
      depMap.map((name: string) =>
        fixturePromises[name].then((fixture: FixtureObject) => ({ name, fixture }))
      )
    )
    const promise = constructFixturePromise(fname, dependenciesPromise)
    if (fname in fixturePromises) {
      fixturePromises[fname] = fixturePromises[fname].then(() => promise)
    } else {
      fixturePromises[fname] = promise
    }
    graph.adjacent(fname).forEach(adj => {
      fixturePromises[adj] = promise
    })
  })
  debug('fixture promises: %o names: %o', fixturePromises, fixtureNames)

  const objects = await Promise.all(fixtureNames.map(n => fixturePromises[n]))
  return objects
}
