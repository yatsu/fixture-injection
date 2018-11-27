# fixture-injection

__fixture-injection is now under construction. NPM packages are not ready.__

fixture-injection is a test helper tool for [Jest](https://jestjs.io/) and
[Jasmine](https://jasmine.github.io/) to define and use fixtures easily by
leveraging [dependency injection](https://www.wikiwand.com/en/Dependency_injection<Paste>).

Fixtures are code that sets up test subjects and the testing environment, which
are defined as a value or a function. These fixtures can be injected to
`beforeAll()`, `it()`, `test()`, etc. as arguments.

## Install/Setup

### Jest

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

Create `jest.config.js`. You can choose `jsdom` or `node` as the test environment:

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
  globalFixtures: '<rootDir>/tests/__global_fixtures__'
}
```

Write your fixtures in `tests/__fixtures__.js` and `tests/__global_fixtures__.js`.

#### Create React App

(TBD)

### Jasmine

(TBD)

## Usage

`tests/__fixtures__.js`:

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

example.spec.js:

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
