#!/bin/bash -eu

yarn lerna add "$@" --scope=jest-fixture-injection
