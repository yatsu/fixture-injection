# fixture-injection

[![CircleCI](https://circleci.com/gh/yatsu/fixture-injection.svg?style=svg)](https://circleci.com/gh/yatsu/fixture-injection)

__Note: fixture-injection is still in alpha stage.__

fixture-injection is a test helper tool for [Jest](https://jestjs.io/) and [Jasmine](https://jasmine.github.io/) to inject fixtures into test functions and `beforeAll()` by leveraging [dependency injection](https://www.wikiwand.com/en/Dependency_injection).

* Test functions use fixtures by declaring the fixture names as arguments.
* Fixtures can use other fixtures and fixture-injection manages the dependencies.
* Fixtures can have asynchronous setup and teardown in it.
* Global fixtures are instantiated in the global scope and shared by multiple test suites (independent workers of Jest) and used as a singleton, whereas local fixtures are instantiated in each local scope.

## Usage (Jest)

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
FI_LOGGING=1 yarn tests
```

## Packages

* [fixture-injection](https://github.com/yatsu/fixture-injection/tree/master/packages/fixture-injection)
  * Core package of fixture-injection
  * This package is used internally; You don't need to install this manually
* [jest-fixture-injection](https://github.com/yatsu/fixture-injection/tree/master/packages/jest-fixture-injection)
  * Jest extension to use fixture-injection
  * Use this package for Jest
* [jasmine-fixture-injection](https://github.com/yatsu/fixture-injection/tree/master/packages/jasmine-fixture-injection)
  * Jasmine extension to use fixture-injection
  * Use this package for Jasmine

## Install/Setup

See the documentation of each test framework extension.

* for Jest &rarr; [jest-fixture-injection](https://github.com/yatsu/fixture-injection/tree/master/packages/jest-fixture-injection)
* for Jasmine &rarr; [jasmine-fixture-injection](https://github.com/yatsu/fixture-injection/tree/master/packages/jasmine-fixture-injection)

## Limitations

* `done()` is not available to define asynchronous tests; Use async/await instead
* Don't use transpiler plugins/settings which modify function arguments such as [transform-async-to-generator plugin](https://babeljs.io/docs/en/babel-plugin-transform-async-to-generator) for Babel because fixture-injection parses the argument names at runtime to determine which fixtures to inject.

## FAQ

#### 1) Why not make `describe()` injectable same as `test()` and `it()` instead of manually assigning variables in `beforeAll()`?

Fixture functions can be asynchronous and fixture objects must be resolved before executing the code defined in a function. That means `describe()` must work asynchronously in this case, but it is not possible because [test suites must be defined statically](https://jasmine.github.io/tutorials/async). So `beforeAll()` is the only place to share fixture objects between test functions.

## Related Work

* [pytest](https://docs.pytest.org/en/latest/)
  * pytest is a popular testing framework for Python. fixture-injection was inspired by its [fixtures](https://docs.pytest.org/en/latest/fixture.html). pytest fixture    has a scope (session/module/function) to manage its lifecycle and can be a generator to have setup/teardown logic in it.
