function sleep(msec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, msec)
  })
}

// const foo = () => '-FOO-'

const foo = async (provide) => {
  // console.log('setup foo')
  await sleep(100)
  await provide('-FOO-')
  // console.log('teardown foo')
  await sleep(100)
}

// const bar = () => '-BAR-'

const bar = async (provide) => {
  // console.log('setup bar')
  await sleep(100)
  await provide('-BAR-')
  // console.log('teardown bar')
  await sleep(100)
}

const baz = '-BAZ-'

module.exports = {
  foo,
  bar,
  baz
}
