#!/bin/bash -eu

yarn test-sync --verbose --runInBand
yarn test-async --verbose --runInBand
yarn test-reuse --verbose --runInBand
yarn test-early-teardown --verbose --runInBand
yarn test-global-api --verbose --runInBand
yarn test-e2e --verbose --runInBand
