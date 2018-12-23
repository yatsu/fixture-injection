const { sleep } = require('./helper')

const f = async c => `F(${c})`

const g = async (provide, c, d) => {
  await provide(`G(${c},${d})`)
}

const h = 'H()'

const i = async (provide, d, e) => {
  await provide(`I(${d},${e})`)
}

const j = async (provide, e) => {
  await provide(`J(${e})`)
}

const k = async (provide, f, h) => {
  await provide(`K(${f},${h})`)
}

const l = async (provide, h, j) => {
  await sleep(1000)
  await provide(`L(${h},${j})`)
  await sleep(1000)
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
