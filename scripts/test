#!/bin/bash -eu

lerna run --parallel --bail --ignore "jest-fixture-injection-example-react" test

CI=true lerna run --concurrency 1 --stream --bail \
  --scope "jest-fixture-injection-example-react" test -- --all
