function fixtureObjectOrPromise(fixtureDef, provide) {
  if (typeof fixtureDef === 'function') {
    return fixtureDef(provide)
  }
  return fixtureDef
}

module.exports = {
  IPC_SERVER_ID: 'fixture-injection-server',
  IPC_CLIENT_ID: 'fixture-injection-client',
  fixtureObjectOrPromise
}
