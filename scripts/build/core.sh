#!/bin/bash -eu

lerna run --concurrency 1 --stream --bail --scope "fixture-injection" build
