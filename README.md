# fixture-injection

__fixture-injection is now under construction. NPM packages are not ready.__

fixture-injection is a test helper tool for JavaScript test runners (currently
Jasmine only) to define and use fixtures easily by leveraging dependency injection.

The 'fixture' of fixture-injection is any JavaScript objects,
and they can also be a function to construct and provide a value synchronously or
asynchronously. It can have (asynchronous) setup and teardown logic in it which are executed automatically each time it is injected.

## Packages

- fixture-injection
  - The core package
  - It will not be used directly
- jasmine-fixture-injection
  - An extension for Jasmine to use fixture-injection
- jasmine-fixture-injection-example
  - Example project using jasmine-fixture-injection

## Examples

### Jasmine

fixtures.js:

```js
// Example 1) Simple value
const foo = 'FOO'

// Example 2) Fixture function to provide a value (same as example 1)
const bar = () => 'BAR'

// Example 3) Asynchronous fixture function to provide a value
const baz = async (provide) => {
  // Write setup code here
  await provide('BAZ') // provide the object and wait until suite or test case finishes
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
  useFixture((foo) => { // Inject fixtures to *a suite* by useFixture()
    this.foo = foo
  })
  // foo is initialized in beforeAll() of this block

  it('some test', (bar, baz) => { // Inject fixtures to *a test case* just as arguments
    const { foo } = this // Get fixtures from the suite
    // bar and baz are initialized just before this block
    expect(foo).toEqual('FOO')
    expect(bar).toEqual('BAR')
    expect(baz).toEqual('BAZ')
    // bar and baz are released just after this block
  })
  // foo is released in afterAll() of this block
})
```

## Plan

- Using fixtures in a fixture
  - Build a dependency tree and resolve the initialization order
- Make it ESLint friendly
  - Solve the unused variable error of injected fixtures
    - because some fixtures may not return a value and just do something
- Support Jest
  - Global fixtures shared by multiple test files
    - Test files are executed in an independent test environment and do not share memory
    - Fixtures must be initialized only once and the initialized objects must be shared
- Support Flow type annotation
- Support TypeScript
- Support Angular
