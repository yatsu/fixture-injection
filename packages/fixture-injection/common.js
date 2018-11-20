function fixtureObjectOrPromise(fixtureDef, provide) {
  if (fixtureDef instanceof Function) {
    return fixtureDef(provide)
  }
  return fixtureDef
}

module.exports = {
  fixtureObjectOrPromise
}
