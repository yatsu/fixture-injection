#!/bin/bash -eu

yarn lerna run clean --scope=fixture-injection
yarn lerna run clean --scope=jest-fixture-injection
