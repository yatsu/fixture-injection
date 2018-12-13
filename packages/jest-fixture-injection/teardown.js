const process = require('process')
const { FixtureServer } = require('fixture-injection')

function pad(num, len) {
  return num.toString().padStart(len, '0')
}

function formatTime(time) {
  const usec = time % 1000000
  const sec = Math.floor(time / 1000000) % 60
  const min = Math.floor(time / 1000000 / 60)
  return `${pad(min, 3)}:${pad(sec, 2)}.${pad(usec, 6)}`
}

function formatDuration(duration) {
  return duration ? `  (${duration / 1000}ms)` : ''
}

function formatFixtureLog(time, payload) {
  const {
    operation, event, scope, name, duration
  } = payload
  return `[${formatTime(time)}] [F|${scope}] ${operation} ${name} | ${event}${formatDuration(
    duration
  )}`
}

function formatFnLog(time, payload) {
  const {
    label, desc, ancestors, fixtures, event, duration
  } = payload
  const testPath = [ancestors.join(' -> '), desc].join(' -> ')
  return `[${formatTime(time)}] [ ${label} ] ${testPath} <${fixtures.join(
    ', '
  )}> | ${event}${formatDuration(duration)}`
}

function formatLog(log) {
  const { time, type, payload } = log
  return type === 'fixture' ? formatFixtureLog(time, payload) : formatFnLog(time, payload)
}

async function teardown() {
  const logs = await FixtureServer.teardown()
  if (process.env.FI_LOGGING === '1') {
    process.stdout.write('--- Fixture Log ---\n')
    logs.forEach((log) => {
      process.stdout.write(`${formatLog(log)}\n`)
    })
    process.stdout.write('-------------------\n')
  }
}

module.exports = teardown
