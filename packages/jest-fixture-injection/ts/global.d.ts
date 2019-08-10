import { Describe as DescribeOrg, Fixture, It as ItOrg, Lifecycle } from 'fixture-injection'

export type Describe = DescribeOrg & {
  only: Describe
  skip: Describe
}

export type It = ItOrg & {
  only: It
  skip: It
  todo: It
  concurrent: It
}

declare global {
  var fixture: (name: string, fn: Fixture) => void

  // @ts-ignore
  var describe: Describe
  // @ts-ignore
  var fdescribe: Describe
  // @ts-ignore
  var xdescribe: Describe
  // @ts-ignore
  var beforeAll: Lifecycle
  // @ts-ignore
  var beforeEach: Lifecycle
  // @ts-ignore
  var afterAll: Lifecycle
  // @ts-ignore
  var afterEach: Lifecycle

  // @ts-ignore
  var it: It
  // @ts-ignore
  var fit: It
  // @ts-ignore
  var xit: It
  // @ts-ignore
  var test: It
  // @ts-ignore
  var xtest: It
}
