#!/bin/bash -eu

FIXTURE_INJECTION_CONFIG=global-api/fixture-injection.config.js \
jest -c global-api/jest.config.js --rootDir "$(pwd)" "$@"
