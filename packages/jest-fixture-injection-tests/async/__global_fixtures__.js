const { sleep } = require('./helper')

const a = async (provide) => {
  await sleep(1)
  await provide('A()')
  await sleep(1)
}

const b = async (provide) => {
  await sleep(1)
  await provide('B()')
  await sleep(1)
}

const c = async (provide) => {
  await sleep(1)
  await provide('C()')
  await sleep(1)
}

const d = async (provide, a, b) => {
  await sleep(1)
  await provide(`D(${a},${b})`)
  await sleep(1)
}

const e = async (provide) => {
  await sleep(1)
  await provide('E()')
  await sleep(1)
}

module.exports = {
  a,
  b,
  c,
  d,
  e
}
