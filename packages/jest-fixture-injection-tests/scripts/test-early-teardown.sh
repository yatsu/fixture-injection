#!/bin/bash -eu

FIXTURE_INJECTION_CONFIG=early-teardown/fixture-injection.config.js \
jest -c early-teardown/jest.config.js --rootDir "$(pwd)" "$@"
