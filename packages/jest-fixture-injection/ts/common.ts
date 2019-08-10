import fs from 'fs'
import path from 'path'

import { ScriptTransformer } from '@jest/transform'
import { Config, Global } from '@jest/types'
import createDebug from 'debug'
import { Fixture, Lifecycle } from 'fixture-injection/ts/types'
import { addHook } from 'pirates'

const debug = createDebug('jest-fixture-injection:common')

type Win = Pick<jest.Environment, 'global'>

export type FIGlobal = Win &
  Global.Global & {
    expect: jest.Expect | undefined
    beforeAll: Lifecycle | undefined
    beforeEach: Lifecycle | undefined
    afterAll: Lifecycle | undefined
    afterEach: Lifecycle | undefined
    describe: jest.Describe | undefined
    fdescribe: jest.Describe | undefined
    xdescribe: jest.Describe | undefined
    it: jest.It | undefined
    fit: jest.It | undefined
    xit: jest.It | undefined
    test: jest.It | undefined
    xtest: jest.It | undefined
    fixture: Fixture | undefined
    nonuse: (...args: any[]) => void
  }

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
      matcher: filename => {
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
