const { nonuse } = require('jasmine-fixture-injection')
const { sleep } = require('./helper')

const quuux = async (provide) => {
  // console.log('setup quuux')
  await sleep(100)
  await provide('-GLOBAL-QUUUX-')
  // console.log('teardown quuux')
  await sleep(100)
}

const foo = async (provide, quuux) => {
  nonuse(quuux)
  // console.log('setup foo', quuux)
  await sleep(100)
  await provide('-GLOBAL-FOO-')
  // console.log('teardown foo')
  await sleep(100)
}

module.exports = {
  foo,
  quuux
}
