const { sleep } = require("./helper");

const bar = async provide => {
  // console.log('setup bar')
  await sleep(100);
  await provide("-BAR-");
  // console.log('teardown bar')
  await sleep(100);
};

const baz = "-BAZ-";

module.exports = {
  bar,
  baz
};
