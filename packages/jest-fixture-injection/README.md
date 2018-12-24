# jest-fixture-injection

[Jest](https://jestjs.io/) extension to use [fixture-injection](https://github.com/yatsu/fixture-injection).

__Note: jest-fixture-injection is still in alpha stage.__

fixture-injection is a test helper tool for [Jest](https://jestjs.io/) and [Jasmine](https://jasmine.github.io/) to inject fixtures into test functions and `beforeAll()` by leveraging [dependency injection](https://www.wikiwand.com/en/Dependency_injection).

* Test functions use fixtures by declaring the fixture names as arguments.
* Fixtures can use other fixtures and fixture-injection manages the dependencies.
* Fixtures can have asynchronous setup and teardown in it.
* Global fixtures are instantiated in the global scope and shared by multiple test suites (independent workers in Jest) and used as a singleton, whereas local fixtures are instantiated in each local scope.

## Usage

Define fixtures in `__fixtures__.js`:

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

  test('with fixtures', (bar, baz) => { // Inject fixtures to *a test case*
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

Set environment variable `FI_LOGGING=1` to print the log.

```sh
FI_LOGGING=1 jest
```

# Prerequisite

* Node.js >= 8
* Jest >= 22

## Install/Setup

### Basic Setup

Install `jest-fixture-injection` into your NPM project:

```sh
$ npm install --dev jest-fixture-injection
```

Or, if you use Yarn:

```sh
$ yarn add --dev jest-fixture-injection
```

Define `test` command in `package.json`:

```json
{
  "scripts": {
    "test": "jest -c jest.config.js"
  }
}
```

Create `jest.config.js`. You can choose `jsdom` or `node` as the test
environment:

```js
module.exports = {
  preset: 'jest-fixture-injection',
  testEnvironment: 'jest-fixture-injection/jsdom'
}
```

Or,

```js
module.exports = {
  preset: 'jest-fixture-injection',
  testEnvironment: 'jest-fixture-injection/node'
}
```

Create `fixture-injection.config.js`:

```js
module.exports = {
  fixtures: '<rootDir>/tests/__fixtures__',
  globalFixtures: '<rootDir>/tests/__global_fixtures__',
  ipc: {
    appspace: 'my-app'
  }
}
```

* Create your local fixtures in `tests/__fixures__.js` or
  `tests/__fixtures__/index.js`
* Create your global fixtures in `tests/__global_fixtures__.js` or
  `tests/__global_fixtures__/index.js`
* Set `ipc.appspace`
  * It must be unique when you use jest-fixture-injection in multiple processes at a time
  * It will be used as the socket file name prefix (e.g., socket file: `/tmp/my-app-fixutre-injection-server`)
* You can set other IPC options; See [node-ipc/IPC Config](https://www.npmjs.com/package/node-ipc#ipc-config)

### Create React App

The easiest way to overwrite CRA's Jest configuration is to use [craco](https://github.com/sharegate/craco).

Follow the [craco Installation](https://github.com/sharegate/craco/blob/master/packages/craco/README.md#installation) and edit `craco.config.js` as follows:

```js
module.exports = {
  jest: {
    configure: (jestConfig) => Object.assign({}, jestConfig, {
      preset: 'jest-fixture-injection',
      testMatch: [ // integration tests and fixtures in `./tests`
        ...jestConfig.testMatch,
        '<rootDir>/tests/**/?(*.)(spec|test).{js,jsx,ts,tsx}'
      ]
    })
  }
}
```

Let `yarn test` use jest-fixture-injection's test environment.

`package.json`:

```json
{
  "scripts": {
    "test": "craco test --env=jest-fixture-injection/jsdom"
  }
}
```

Or, if you use `node` environment:

```json
{
  "scripts": {
    "test": "craco test --env=jest-fixture-injection/node"
  }
}
```

Setting `--env` is required here because verwriting `testEnvironment` by craco does work (at 2018-11-20).

## Limitations

Don't use transpiler plugins/settings which modify function arguments such as [transform-async-to-generator plugin](https://babeljs.io/docs/en/babel-plugin-transform-async-to-generator) for Babel because fixture-injection parses the argument names at runtime to determine which fixtures to inject.

## Examples

* [jest-fixture-injection-example](https://github.com/yatsu/fixture-injection/tree/master/packages/jest-fixture-injection-example)
  * Using jest-fixture-injection with a simple Jest config
* [jest-fixture-injection-example-cra](https://github.com/yatsu/fixture-injection/tree/master/packages/jest-fixture-injection-example-cra)
  * Using jest-fixture-injection in a React project generated by [Create React App](https://github.com/facebook/create-react-app)
