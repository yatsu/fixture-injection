const { sleep } = require('./helper')

const a = 'A()'

const b = () => 'B()'

const c = async (provide) => {
  await sleep(1000)
  await provide('C()')
  await sleep(1000)
}

const d = async (provide, a, b) => {
  await provide(`D(${a},${b})`)
}

const e = async (provide) => {
  await provide('E()')
}

module.exports = {
  a,
  b,
  c,
  d,
  e
}
