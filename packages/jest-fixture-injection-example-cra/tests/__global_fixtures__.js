const { sleep } = require("./helper");

const foo = async provide => {
  // console.log('setup foo')
  await sleep(100);
  await provide("-GLOBAL-FOO-");
  // console.log('teardown foo')
  await sleep(100);
};

module.exports = {
  foo
};
