const getArguments = require('es-arguments')
const Graph = require('graph-data-structure')

const IPC_SERVER_ID = 'fixture-injection-server'

const IPC_CLIENT_ID = 'fixture-injection-client'

const IPC_DEFAULT_OPTIONS = {
  silent: true
}

function isObject(obj) {
  return obj === Object(obj)
}

function fixtureArguments(fixtureDef) {
  if (typeof fixtureDef !== 'function') {
    return []
  }
  return getArguments(fixtureDef).filter(name => name !== 'provide')
}

function freezeOrCopy(obj, freeze) {
  if (freeze) {
    return Object.freeze(obj)
  }
  if (isObject(obj)) {
    return Object.assign({}, obj)
  }
  return obj
}

function fixturePromise(
  fixtureDef,
  provide,
  dependencies,
  freeze = false,
  onSetupStart = null,
  onSetupEnd = null,
  onTeardownStart = null,
  onTeardownEnd = null
) {
  if (onSetupStart) onSetupStart()

  if (typeof fixtureDef === 'function') {
    const provideWithLogging = (fixture) => {
      if (onSetupEnd) onSetupEnd()
      const fnFinish = provide(fixture)
      fnFinish.then(() => {
        if (onTeardownStart) onTeardownStart()
      })
      return fnFinish
    }
    const index = getArguments(fixtureDef).indexOf('provide')
    const result = index < 0
      ? fixtureDef(...dependencies)
      : fixtureDef(
        ...dependencies.slice(0, index),
        provideWithLogging,
        ...dependencies.slice(index)
      )

    if (typeof result.then === 'function') {
      if (index < 0) {
        return new Promise((resolve) => {
          result.then((fo) => {
            provideWithLogging(fo).then(() => {
              if (onTeardownEnd) onTeardownEnd()
              resolve()
            })
          })
        })
      }
      return new Promise((resolve) => {
        result.then(() => {
          if (onTeardownEnd) onTeardownEnd()
          resolve()
        })
      })
    }

    if (onSetupEnd) onSetupEnd()

    const obj = freezeOrCopy(result, freeze)
    return new Promise((resolve) => {
      provide(obj).then(() => {
        if (onTeardownStart) onTeardownStart()
        if (onTeardownEnd) onTeardownEnd()
        resolve(obj)
      })
    })
  }

  if (onSetupEnd) onSetupEnd()

  // Value fixture defined as `foo = 'FOO'`
  const obj = freezeOrCopy(fixtureDef, freeze)
  return new Promise((resolve) => {
    provide(obj).then(() => {
      if (onTeardownStart) onTeardownStart()
      if (onTeardownEnd) onTeardownEnd()
      resolve(obj)
    })
  })
}

function constructDependencyMap(fixtures) {
  return Object.keys(fixtures).reduce(
    (acc, name) => Object.assign({}, acc, {
      [name]: fixtureArguments(fixtures[name])
    }),
    {}
  )
}

function dependencyGraph(fixtureNames, dependencyMap) {
  const graph = new Graph()
  const construct = (name) => {
    graph.addNode(name)
    dependencyMap[name].forEach((dep) => {
      construct(dep)
      graph.addEdge(dep, name)
    })
  }
  fixtureNames.forEach(construct)
  return graph
}

async function fixtureObjects(fixtureNames, dependencyMap, constructFixturePromise) {
  const fixturePromises = {}
  const graph = dependencyGraph(fixtureNames, dependencyMap)
  graph.topologicalSort().forEach((fname) => {
    const dependenciesPromise = Promise.all(
      dependencyMap[fname].map(name => fixturePromises[name].then(fixture => ({ name, fixture })))
    )
    const promise = constructFixturePromise(fname, dependenciesPromise)
    if (fname in fixturePromises) {
      fixturePromises[fname] = fixturePromises[fname].then(() => promise)
    } else {
      fixturePromises[fname] = promise
    }
    graph.adjacent(fname).forEach((adj) => {
      fixturePromises[adj] = promise
    })
  })

  const objects = await Promise.all(fixtureNames.map(n => fixturePromises[n]))
  return objects
}

module.exports = {
  IPC_SERVER_ID,
  IPC_CLIENT_ID,
  IPC_DEFAULT_OPTIONS,
  fixtureArguments,
  fixturePromise,
  constructDependencyMap,
  dependencyGraph,
  fixtureObjects
}
