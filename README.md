# fixture-injection

[![CircleCI](https://circleci.com/gh/yatsu/fixture-injection.svg?style=svg)](https://circleci.com/gh/yatsu/fixture-injection)

__Note: fixture-injection is still in alpha stage.__

fixture-injection is a test helper tool for [Jest](https://jestjs.io/) and [Jasmine](https://jasmine.github.io/) to define and use fixtures easily by leveraging [dependency injection](https://www.wikiwand.com/en/Dependency_injection<Paste>).

Fixtures are code that sets up test subjects and the testing environment defined as a value or a function. These fixtures can be injected to `beforeAll()`, `it()`, `test()`, etc. as arguments.

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

`example.spec.js`:

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
FI_LOGGING=1 yarn tests
```

## Features

1. The code in the fixture function can do whatever you want
2. Fixture function can be asynchronous and can have setup and teardown code around `await provide()` 
3. Fixtures are also available in other fixtures, and the dependencies are automatically resolved
   * Asynchronous fixtures are initialized concurrently as much as possible
4. Local fixtures are initialized every time in each injected context
5. Global fixtures are singletons and initialized only once
   * [Jest] They are initialized by Jest runner and will be sent to individual test workers via IPC
6. In-line fixtures are also available by `fixture()` in each test file
7. Detailed setup/teardown log of fixtures, test functions, beforeAll and afterAll.

## Packages

* fixture-injection
  * Core package of fixture-injection
* [jest-fixture-injection](https://github.com/yatsu/fixture-injection/tree/master/packages/jest-fixture-injection)
  * Jest extension to use fixture-injection
* [jasmine-fixture-injection](https://github.com/yatsu/fixture-injection/tree/master/packages/jasmine-fixture-injection)
  * Jasmine extension to use fixture-injection

## Install/Setup

See the documentation of each test framework extension.

* [jest-fixture-injection](https://github.com/yatsu/fixture-injection/tree/master/packages/jest-fixture-injection)
* [jasmine-fixture-injection](https://github.com/yatsu/fixture-injection/tree/master/packages/jasmine-fixture-injection)

## Limitations

Don't use Babel [transform-async-to-generator plugin](https://babeljs.io/docs/en/babel-plugin-transform-async-to-generator) because it modifies async/await function's arguments and fixture-injection cannot handle it.

## Related Work

* [pytest](https://docs.pytest.org/en/latest/)
  * pytest is a popular testing framework for Python. fixture-injection was inspired by its [fixtures](https://docs.pytest.org/en/latest/fixture.html). pytest fixture    has a scope (session/module/function) to manage its lifecycle and can be a generator to have setup/teardown logic in it.
