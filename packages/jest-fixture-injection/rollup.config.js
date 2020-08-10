import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import multiinput from 'rollup-plugin-multi-input'
import nodeExternals from 'rollup-plugin-node-externals'
import sourcemaps from 'rollup-plugin-sourcemaps'
import ts from '@wessberg/rollup-plugin-ts'

const pkg = require('./package.json')
const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
  'debug',
  'fsevents',
  'jest-util',
  '@jest/globals',
  '@jest/transform',
  '@jest/types'
]

export default {
  input: ['ts/*.ts'],
  external,
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
      banner: '/* eslint-disable */'
    }
  ],
  plugins: [
    multiinput({
      relative: 'ts/',
      glob: { ignore: ['ts/*.d.ts'] }
    }),
    json({
      indent: '  '
    }),
    nodeExternals({
      builtins: true
    }),
    resolve(),
    ts({
      transpiler: 'babel'
    }),
    commonjs(),
    sourcemaps()
  ]
}
