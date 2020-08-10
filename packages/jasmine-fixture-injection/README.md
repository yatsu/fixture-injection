# jasmine-fixture-injection

[Jasmine](https://jasmine.github.io/) extension to use [fixture-injection](https://github.com/yatsu/fixture-injection).

__Note: jasmine-fixture-injection is still in alpha stage.__

fixture-injection is a test helper tool for [Jest](https://jestjs.io/) and [Jasmine](https://jasmine.github.io/) to inject fixtures into test functions and `beforeAll()` by leveraging [dependency injection](https://www.wikiwand.com/en/Dependency_injection).

* Test functions use fixtures by declaring the fixture names as arguments.
* Fixtures can use other fixtures and fixture-injection manages the dependencies.
* Fixtures can have asynchronous setup and teardown in it.
* Global fixtures are instantiated in the global scope and shared by multiple test suites (independent workers in Jest) and used as a singleton, whereas local fixtures are instantiated in each local scope.

## Usage

Define fixtures in `fixtures.js`:

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

Use fixtures in test functions or `beforeAll()`:

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

Set environment variable `FI_LOGGING=true` to print the log.

```sh
FI_LOGGING=true yarn tests
```

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

You can use [scripty](https://www.npmjs.com/package/scripty) to run this by `yarn test` or `npm run test`.

`package.json`:

```json
{
  "scripts": {
    "test": "scripty"
  }
}
```

## Limitations

* `done()` is not available to define asynchronous tests; Use async/await instead
* Don't use transpiler plugins/settings which modifiy function arguments such as [transform-async-to-generator plugin](https://babeljs.io/docs/en/babel-plugin-transform-async-to-generator) for Babel because fixture-injection parses the argument names at runtime to determine which fixtures to inject.

## Examples

* [jasmine-fixture-injection-example](https://github.com/yatsu/fixture-injection/tree/master/packages/jasmine-fixture-injection-example)
  * Using jasmine-fixture-injection with a simple Jasmine config
