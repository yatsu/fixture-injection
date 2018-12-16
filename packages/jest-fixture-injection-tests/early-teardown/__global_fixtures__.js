const a = async (provide) => {
  await provide('A()')
}

const b = async (provide) => {
  await provide('B()')
}

const c = async (provide) => {
  await provide('C()')
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
