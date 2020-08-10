#!/bin/bash -e

rimraf dist

rollup -c rollup.config.js

grep -v '^declare var' node_modules/@types/jest/index.d.ts > dist/jest.d.ts

cp ts/global.d.ts dist
cp ts/index.d.ts dist
