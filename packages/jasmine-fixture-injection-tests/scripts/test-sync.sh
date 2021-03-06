#!/usr/bin/env node

const path = require('path')
const Jasmine = require('jasmine')
const Command = require('jasmine/lib/command')
const JasmineConsoleReporter = require('jasmine-console-reporter')
const FixtureReporter = require('jasmine-fixture-injection/reporter')

const jasmine = new Jasmine()
jasmine.loadConfig({
  spec_dir: './sync',
  spec_files: ['../sync/**/*[sS]pec.js'],
  helpers: ['../node_modules/jasmine-fixture-injection/helper.js']
})
jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000

const fixtureReporter = new FixtureReporter({
  globalFixtures: '../sync/globalFixtures',
  fixtures: '../sync/fixtures'
})

const consoleReporter = new JasmineConsoleReporter({
  colors: 1,
  cleanStack: 1,
  verbosity: 4,
  listStyle: 'indent',
  timeUnit: 'ms',
  timeThreshold: { ok: 500, warn: 1000, ouch: 3000 },
  activity: false,
  emoji: false,
  beep: false
})

jasmine.env.clearReporters()
jasmine.addReporter(fixtureReporter)
jasmine.addReporter(consoleReporter)

const examplesDir = path.join(
  path.dirname(require.resolve('jasmine-core')),
  'jasmine-core', 'example', 'node_example'
)
const command = new Command(path.resolve(), examplesDir, console.log)

command.run(jasmine, process.argv.slice(2))
