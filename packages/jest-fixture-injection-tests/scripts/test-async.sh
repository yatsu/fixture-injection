#!/bin/bash -eu

FIXTURE_INJECTION_CONFIG=async/fixture-injection.config.js \
jest -c async/jest.config.js --rootDir "$(pwd)" "$@"
