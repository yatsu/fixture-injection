// Fixtures:
//   const foo = true
//   const bar = () => 3
//   const baz = async (provide: Provide) => { await provide('baz') }
export type Fixture = any

// Fixture objects:
//   foo => true
//   bar => 3
//   baz => 'baz'
export type FixtureObject = any

export interface FixtureContainer {
  name: string
  fixture: FixtureObject
}

export type EmptyFunction = () => void

export interface Describe {
  (desc: string, fn: EmptyFunction): void
}

export type Lifecycle = (fn: (...fixtures: any[]) => void) => any

export interface It {
  (name: string, fn: (...fixtures: any[]) => any): void
}

export type IpcResolver = (fixtureObject: FixtureObject) => void

export type DependencyMap = Record<string, string[]>

export type Provide = (fixtureObject: FixtureObject) => Promise<void>
