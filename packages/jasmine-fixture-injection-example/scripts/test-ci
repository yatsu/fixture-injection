#!/usr/bin/env node

const path = require('path')
const Jasmine = require('jasmine')
const Command = require('jasmine/lib/command')
const jasmineReporters = require('jasmine-reporters')
const FixtureReporter = require('jasmine-fixture-injection/reporter')

const jasmine = new Jasmine()
jasmine.loadConfig({
  spec_dir: './spec',
  spec_files: ['../spec/**/*[sS]pec.js'],
  helpers: ['../node_modules/jasmine-fixture-injection/helper.js']
})
jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000

const fixtureReporter = new FixtureReporter({
  globalFixtures: '../spec/globalFixtures',
  fixtures: '../spec/fixtures'
})

const junitReporter = new jasmineReporters.JUnitXmlReporter({
  savePath: './reports/jasmine',
  filePrefix: 'results',
  consolidateAll: true
})

jasmine.env.clearReporters()
jasmine.addReporter(fixtureReporter)
jasmine.addReporter(junitReporter)

const examplesDir = path.join(
  path.dirname(require.resolve('jasmine-core')),
  'jasmine-core', 'example', 'node_example'
)
const command = new Command(path.resolve(), examplesDir, console.log)

command.run(jasmine, process.argv.slice(2))
