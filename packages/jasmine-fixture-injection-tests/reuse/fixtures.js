const nanoid = require('nanoid')
const { sleep } = require('./helper')

const d = { name: 'd', id: nanoid(10) }

const e = () => ({ name: 'e', id: nanoid(10) })

const f = async (provide) => {
  await sleep(1)
  await provide({ name: 'f', id: nanoid(10) })
  await sleep(1)
}

module.exports = {
  d,
  e,
  f
}
