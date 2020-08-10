import fs from 'fs'
import path from 'path'

import { describe, expect, fdescribe, fit, it, jest, test, xdescribe, xit, xtest } from '@jest/globals'
import { ScriptTransformer } from '@jest/transform'
import { Config, Global } from '@jest/types'
import createDebug from 'debug'
import { Fixture, Lifecycle } from 'fixture-injection'
import { addHook } from 'pirates'

const debug = createDebug('jest-fixture-injection:common')

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export type FIGlobal = Overwrite<Global.Global, {
  jest: typeof jest
  expect: typeof expect
  beforeAll: Lifecycle
  beforeEach: Lifecycle
  afterAll: Lifecycle
  afterEach: Lifecycle
  describe: typeof describe
  fdescribe: typeof fdescribe
  xdescribe: typeof xdescribe
  it: typeof it
  fit: typeof fit
  xit: typeof xit
  test: typeof test
  xtest: typeof xtest
  fixture: Fixture | undefined
  nonuse: (...args: any[]) => void
}>

function resolvePath(rootDir: string, fixturesPath: string): string {
  return path.isAbsolute(fixturesPath) ? fixturesPath : path.resolve(rootDir, fixturesPath)
}

export function replaceRootDirInPath(rootDir: string, filePath: string): string {
  if (!/^<rootDir>/.test(filePath)) {
    return filePath
  }
  return path.resolve(rootDir, path.normalize(`./${filePath.substr('<rootDir>'.length)}`))
}

export async function loadFixtures(
  config: Config.ProjectConfig,
  fixturesPath: string
): Promise<Record<string, Fixture>> {
  debug('loadFixtures - rootDir: %s fixturesPath: %s', config.rootDir, fixturesPath)
  const transformer = new ScriptTransformer(config)
  const fpath = resolvePath(config.rootDir, replaceRootDirInPath(config.rootDir, fixturesPath))
  if (!fs.existsSync(fpath)) {
    throw new Error(`File ${fpath} does not exist`)
  }
  delete require.cache[require.resolve(fpath)]
  const fixtures: Record<string, Fixture> = await requireAndTranspileModule(transformer, fpath)
  debug('loaded fixtures: %o', fixtures)
  return fixtures
}

// Ported from @jest/transform git master
// The original license:
// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
async function requireAndTranspileModule<ModuleType = unknown>(
  transformer: ScriptTransformer,
  moduleName: string
): Promise<ModuleType> {
  // Load the transformer to avoid a cycle where we need to load a
  // transformer in order to transform it in the require hooks
  transformer.preloadTransformer(moduleName)

  let transforming = false
  const revertHook = addHook(
    (code, filename) => {
      try {
        transforming = true
        return transformer.transformSource(filename, code, false).code || code
      } finally {
        transforming = false
      }
    },
    {
      exts: [path.extname(moduleName)],
      ignoreNodeModules: false,
      matcher: (filename: string) => {
        if (transforming) {
          // Don't transform any dependency required by the transformer itself
          return false
        }
        return transformer.shouldTransform(filename)
      }
    }
  )
  debug('require module: %s', moduleName)
  const module: ModuleType = require(moduleName)

  revertHook()

  return module
}
