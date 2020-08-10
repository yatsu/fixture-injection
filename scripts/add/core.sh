#!/bin/bash -eu

yarn lerna add "$@" --scope=fixture-injection
