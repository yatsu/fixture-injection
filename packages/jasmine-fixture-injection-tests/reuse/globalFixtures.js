const { nanoid } = require('nanoid')
const { sleep } = require('./helper')

const a = { name: 'a', id: nanoid(10) }

const b = () => ({ name: 'b', id: nanoid(10) })

const c = async (provide) => {
  await sleep(1)
  await provide({ name: 'c', id: nanoid(10) })
  await sleep(1)
}

module.exports = {
  a,
  b,
  c
}
