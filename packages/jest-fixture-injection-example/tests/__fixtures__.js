const { nonuse } = require('jest-fixture-injection')
const { sleep } = require('./helper')

const quux = async (provide) => {
  // console.log('setup quux')
  await sleep(100)
  await provide('-QUUX-')
  // console.log('teardown quux')
  await sleep(100)
}

const bar = async (provide, quux, quuux) => {
  nonuse(quux)
  nonuse(quuux)
  // console.log('setup bar', quux, quuux)
  await sleep(100)
  await provide('-BAR-')
  // console.log('teardown bar')
  await sleep(100)
}

const baz = '-BAZ-'

module.exports = {
  bar,
  baz,
  quux
}
