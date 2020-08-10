#!/bin/bash -eu

rimraf dist

rollup -c rollup.config.js
