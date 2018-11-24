const { sleep } = require('./helper')

const f = async (provide, c) => {
  await sleep(1)
  await provide(`F(${c})`)
  await sleep(1)
}

const g = async (provide, c, d) => {
  await sleep(1)
  await provide(`G(${c},${d})`)
  await sleep(1)
}

const h = async (provide) => {
  await sleep(1)
  await provide('H()')
  await sleep(1)
}

const i = async (provide, d, e) => {
  await sleep(1)
  await provide(`I(${d},${e})`)
  await sleep(1)
}

const j = async (provide, e) => {
  await sleep(1)
  await provide(`J(${e})`)
  await sleep(1)
}

const k = async (provide, f, h) => {
  await sleep(1)
  await provide(`K(${f},${h})`)
  await sleep(1)
}

const l = async (provide, h, j) => {
  await sleep(1)
  await provide(`L(${h},${j})`)
  await sleep(1)
}

module.exports = {
  f,
  g,
  h,
  i,
  j,
  k,
  l
}
