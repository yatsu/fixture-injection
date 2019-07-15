#!/bin/bash -eu

JEST_JUNIT_OUTPUT="<rootDir>/reports/jest/results.xml" \
  jest -c jest.config.js --reporters=default --reporters=jest-junit \
  --runInBand --detectOpenHandles
