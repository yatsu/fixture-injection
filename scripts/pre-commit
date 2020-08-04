#!/bin/bash -eu

yarn lerna run build --scope=fixture-injection
yarn lerna run build --scope=jest-fixture-injection

yarn test-ci

yarn audit --groups=dependencies
for pkg in $(/bin/ls ./packages); do
  (cd "packages/${pkg}" && yarn audit --groups=dependencies)
done
