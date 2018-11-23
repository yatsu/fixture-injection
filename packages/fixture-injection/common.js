const getArguments = require('es-arguments')
const Graph = require('graph-data-structure')

function fixtureArguments(fixtureDef) {
  if (typeof fixtureDef !== 'function') {
    return []
  }
  return getArguments(fixtureDef).filter(name => name !== 'provide')
}

function fixtureObjectOrPromise(fixtureDef, provide, dependencies) {
  if (typeof fixtureDef === 'function') {
    return fixtureDef(provide, ...dependencies)
  }
  return fixtureDef
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
  fixtureNames.forEach((name) => {
    graph.addNode(name)
    dependencyMap[name].forEach((dep) => {
      graph.addNode(dep)
      graph.addEdge(dep, name)
    })
  }, {})
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
  fixtureArguments,
  fixtureObjectOrPromise,
  constructDependencyMap,
  dependencyGraph,
  fixtureObjects
}
