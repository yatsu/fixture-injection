function sleep(msec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, msec)
  })
}

// const gfoo = () => '-GFOO-'

const gfoo = async (provide) => {
  // console.log('setup gfoo')
  await sleep(100)
  await provide('-GFOO-')
  // console.log('teardown gfoo')
  await sleep(100)
}

// const gbar = () => '-GBAR-'

const gbar = async (provide) => {
  // console.log('setup gbar')
  await sleep(100)
  await provide('-GBAR-')
  // console.log('teardown gbar')
  await sleep(100)
}

const gbaz = '-GBAZ-'

module.exports = {
  gfoo,
  gbar,
  gbaz
}
