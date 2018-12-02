# jasmine-fixture-injection

[Jasmine](https://jasmine.github.io/) extension to use
[fixture-injection](https://github.com/yatsu/fixture-injection).

__Note: jasmine-fixture-injection is still in alpha stage.__

fixture-injection is a test helper tool to define and use fixtures easily by
leveraging [dependency
injection](https://www.wikiwand.com/en/Dependency_injection<Paste>). Fixtures
are code that sets up test subjects and the testing environment defined as
a value or a function. These fixtures can be injected to `beforeAll()`, `it()`,
`test()`, etc. as arguments.

## Usage

`tests/fixtures.js`:

```js
// Example 1) Simple value
const foo = 'FOO'

// Example 2) Fixture function to provide a value which requires another fixture `foo`
const bar = (foo) => `BAR(${foo})`

// Example 3) Asynchronous fixture function to provide a value
const baz = async (provide, bar) => { // requires another fixture `bar`
  // Write setup code here
  await provide(`BAZ(${bar}`) // provide the value
  // `await` above waits until the context (test case or suite) finishes
  // Write teardown code here
}

module.exports = {
  foo,
  bar,
  baz
}
```

`example.spec.js`:

```js
describe('My test suite', () => {
  let fixtures = {}

  beforeAll((foo) => { // Inject fixtures to *a suite* by beforeAll()
    fixtures.foo = foo
  })

  it('with fixtures', (bar, baz) => { // Inject fixtures to *a test case*
    // bar and baz are initialized just before this block
    const { foo } = fixtures // Get fixtures from the suite

    expect(foo).toEqual('FOO')
    expect(bar).toEqual('BAR(FOO)')
    expect(baz).toEqual('BAZ(BAR(FOO))')

    // bar and baz are released just after this block
  })

  // foo is released by hidden afterAll() of this block automatically
})
```

## Features

1. The code in the fixture function can do whatever you want
2. Fixture function can be asynchronous and can have setup and teardown
   code around `await provide()` 
3. Fixtures are also available in other fixtures, and the dependencies are
   automatically resolved
   * Asynchronous fixtures are initialized concurrently as much as possible
4. Local fixtures are initialized every time in each injected context
5. Global fixtures are singletons and initialized only once
6. In-line fixtures are also available by `fixture()` in each test file

# Prerequisite

* Node.js >= 8
* Jasmine >= 3

## Install/Setup

Install `jasmine-fixture-injection` into your NPM project:

```sh
$ npm install --dev jasmine-fixture-injection
```

Or, if you use Yarn:

```sh
$ yarn add --dev jasmine-fixture-injection
```

Create a test runner script `scripts/test`:

```js
#!/usr/bin/env node

const path = require('path')
const Jasmine = require('jasmine')
const Command = require('jasmine/lib/command')
const FixtureReporter = require('jasmine-fixture-injection/reporter')

const jasmine = new Jasmine()
jasmine.loadConfig({
  spec_dir: './spec',
  spec_files: ['../spec/**/*[sS]pec.js'],
  helpers: ['../node_modules/jasmine-fixture-injection/helper.js']
})
jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000

const fixtureReporter = new FixtureReporter({
  globalFixtures: '../spec/globalFixtures',
  fixtures: '../spec/fixtures'
})

jasmine.env.clearReporters()
jasmine.addReporter(fixtureReporter)

const examplesDir = path.join(
  path.dirname(require.resolve('jasmine-core')),
  'jasmine-core', 'example', 'node_example'
)
const command = new Command(path.resolve(), examplesDir, console.log)

command.run(jasmine, process.argv.slice(2))
```

You can use [scripty](https://www.npmjs.com/package/scripty) to run this by
`yarn test` or `npm run test`.

`package.json`:

```json
{
  "scripts": {
    "test": "scripty"
  }
}
```

## Examples

* [jasmine-fixture-injection-example](https://github.com/yatsu/fixture-injection/tree/master/packages/jasmine-fixture-injection-example)
  * Using jasmine-fixture-injection with a simple Jasmine config
