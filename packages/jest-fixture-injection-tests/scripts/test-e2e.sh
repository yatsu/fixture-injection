#!/bin/bash -eu

FIXTURE_INJECTION_CONFIG=e2e/fixture-injection.config.js \
jest -c e2e/jest.config.js --rootDir "$(pwd)" "$@"
