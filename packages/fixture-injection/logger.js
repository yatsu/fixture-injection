const process = require('process')
const microtime = require('microtime')
const ipc = require('node-ipc')
const { IPC_SERVER_ID } = require('./common')

function zeroPad(num, len) {
  return num.toString().padStart(len, '0')
}

function formatTime(time) {
  const usec = time % 1000000
  const sec = Math.floor(time / 1000000) % 60
  const min = Math.floor(time / 1000000 / 60)
  return `${zeroPad(min, 3)}:${zeroPad(sec, 2)}.${zeroPad(usec, 6)}`
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

function formatTestLog(time, payload) {
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
  return type === 'fixture' ? formatFixtureLog(time, payload) : formatTestLog(time, payload)
}

class LocalLogger {
  constructor(logs = []) {
    this.enabled = process.env.FI_LOGGING === '1'
    this.logs = logs
    this.startTime = null
    this.fixtureTimestamps = { SETUP: {}, TEARDOWN: {} }
    this.funcTimestamps = {}
  }

  start() {
    this.startTime = microtime.now()
  }

  fixtureLog(operation, event, scope, name) {
    if (!this.enabled) return

    const time = microtime.now()
    let duration
    if (event === 'START') {
      this.fixtureTimestamps[operation][name] = time
    } else {
      duration = time - this.fixtureTimestamps[operation][name]
    }
    this.logs.push([
      time,
      {
        time: time - this.startTime,
        type: 'fixture',
        payload: {
          operation,
          event,
          scope,
          name,
          duration
        }
      }
    ])
  }

  functionLog(label, desc, ancestors, fixtures, event) {
    if (!this.enabled) return

    const time = microtime.now()
    const testPath = [ancestors.join(' -> '), desc].join(' -> ')
    let duration
    if (event === 'START') {
      this.funcTimestamps[testPath] = time
    } else {
      duration = time - this.funcTimestamps[testPath]
    }
    this.logs.push([
      time,
      {
        time: time - this.startTime,
        type: 'function',
        payload: {
          label,
          desc,
          ancestors,
          fixtures,
          event,
          duration
        }
      }
    ])
  }

  sort() {
    return this.logs.sort((x, y) => x[0] - y[0]).map(x => x[1])
  }

  writeAll(writeFn = console.log) {
    writeFn('--- Fixture Log ---')
    this.sort().forEach((log) => {
      writeFn(`${formatLog(log)}`)
    })
    writeFn('-------------------')
  }
}

class RemoteLogger {
  constructor() {
    this.enabled = process.env.FI_LOGGING === '1'
  }

  fixtureLog(operation, event, scope, name) {
    if (!this.enabled) return

    ipc.of[IPC_SERVER_ID].emit('log', {
      type: 'fixture',
      payload: {
        operation,
        event,
        scope,
        name
      }
    })
  }

  functionLog(label, desc, ancestors, fixtures, event) {
    if (!this.enabled) return

    ipc.of[IPC_SERVER_ID].emit('log', {
      type: 'function',
      payload: {
        label,
        desc,
        ancestors,
        fixtures,
        event
      }
    })
  }
}

module.exports = {
  LocalLogger,
  RemoteLogger
}
