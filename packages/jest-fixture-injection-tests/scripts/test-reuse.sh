#!/bin/bash -eu

FIXTURE_INJECTION_CONFIG=reuse/fixture-injection.config.js \
jest -c reuse/jest.config.js --rootDir "$(pwd)" "$@"
