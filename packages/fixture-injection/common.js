const getArguments = require('es-arguments')
const Graph = require('graph-data-structure')

function isObject(obj) {
  return obj === Object(obj)
}

function fixtureArguments(fixtureDef) {
  if (typeof fixtureDef !== 'function') {
    return []
  }
  return getArguments(fixtureDef).filter(name => name !== 'provide')
}

function fixtureObjectOrPromise(fixtureDef, provide, dependencies, freeze = false) {
  if (typeof fixtureDef === 'function') {
    const index = getArguments(fixtureDef).indexOf('provide')
    const obj = index < 0
      ? fixtureDef(...dependencies)
      : fixtureDef(...dependencies.slice(0, index), provide, ...dependencies.slice(index))
    return freeze ? Object.freeze(obj) : obj
  }
  // Value fixture defined as `foo = 'FOO'`
  if (freeze) return Object.freeze(fixtureDef)
  return isObject(fixtureDef) ? Object.assign({}, fixtureDef) : fixtureDef
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
  IPC_SERVER_ID: 'fixture-injection-server',
  IPC_CLIENT_ID: 'fixture-injection-client',
  IPC_DEFAULT_OPTIONS: {
    silent: true
  },
  fixtureArguments,
  fixtureObjectOrPromise,
  constructDependencyMap,
  dependencyGraph,
  fixtureObjects
}
