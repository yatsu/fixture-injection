import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeExternals from 'rollup-plugin-node-externals'
import sourcemaps from 'rollup-plugin-sourcemaps'
import ts from '@wessberg/rollup-plugin-ts'

const pkg = require('./package.json')
const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
  'debug'
]

export default {
  input: 'ts/index.ts',
  external,
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
      banner: '/* eslint-disable */'
    }
  ],
  plugins: [
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
