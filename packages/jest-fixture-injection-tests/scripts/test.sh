#!/bin/bash -eu

yarn test-sync --verbose --runInBand
yarn test-async --verbose --runInBand
yarn test-reuse --verbose --runInBand
yarn test-early-teardown --verbose --runInBand
yarn test-global-api --verbose --runInBand
yarn test-e2e --verbose --runInBand

JEST_CIRCUS=1 yarn test-sync --verbose --runInBand
JEST_CIRCUS=1 yarn test-async --verbose --runInBand
JEST_CIRCUS=1 yarn test-reuse --verbose --runInBand
JEST_CIRCUS=1 yarn test-early-teardown --verbose --runInBand
JSET_CIRCUS=1 yarn test-global-api --verbose --runInBand
JEST_CIRCUS=1 yarn test-e2e --verbose --runInBand