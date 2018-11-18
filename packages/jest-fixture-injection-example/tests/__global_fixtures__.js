function sleep(msec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, msec)
  })
}

// const gfoo = () => '-FOO-'

const gfoo = async (provide) => {
  console.log('setup gfoo')
  await sleep(100)
  await provide('-gfoo-')
  console.log('teardown gfoo')
  await sleep(100)
}

// const gbar = () => '-BAR-'

const gbar = async (provide) => {
  console.log('setup gbar')
  await sleep(100)
  await provide('-gbar-')
  console.log('teardown gbar')
  await sleep(100)
}

const gbaz = '-BAZ-'

module.exports = {
  gfoo,
  gbar,
  gbaz
}
