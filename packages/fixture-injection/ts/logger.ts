import process from 'process'
import microtime from 'microtime'
import ipc from 'node-ipc'
import { IPC_SERVER_ID } from './common'

export enum Operation {
  Setup,
  Teardown
}

export enum LogEvent {
  Start,
  End
}

export enum Scope {
  Local,
  Global
}

export enum Label {
  Test,
  BeforeAll,
  AfterAll
}

function operationStr(operation: Operation): string {
  switch (operation) {
    case Operation.Setup:
      return 'SETUP'
    case Operation.Teardown:
      return 'TEARDOWN'
  }
}

function logEventStr(logEvent: LogEvent): string {
  switch (logEvent) {
    case LogEvent.Start:
      return 'START'
    case LogEvent.End:
      return 'END'
  }
}

function scopeStr(scope: Scope): string {
  switch (scope) {
    case Scope.Local:
      return 'L'
    case Scope.Global:
      return 'G'
  }
}

function labelStr(label: Label): string {
  switch (label) {
    case Label.Test:
      return 'T'
    case Label.BeforeAll:
      return 'B'
    case Label.AfterAll:
      return 'A'
  }
}

interface FixtureLogPayload {
  operation: string
  event: string
  scope: string
  name: string
  duration: number
}

interface TestLogPayload {
  label: string
  desc: string
  ancestors: string[]
  fixtures: Record<string, any>
  event: string
  duration: number
}

export interface LogPayload {
  time: number
  type: string
  payload: TestLogPayload | FixtureLogPayload
}

function zeroPad(num: number, len: number): string {
  return num.toString().padStart(len, '0')
}

function formatTime(time: number): string {
  const usec = time % 1000000
  const sec = Math.floor(time / 1000000) % 60
  const min = Math.floor(time / 1000000 / 60)
  return `${zeroPad(min, 3)}:${zeroPad(sec, 2)}.${zeroPad(usec, 6)}`
}

function formatDuration(duration: number | undefined): string {
  return duration ? `  (${duration / 1000}ms)` : ''
}

function formatFixtureLog(time: number, payload: FixtureLogPayload): string {
  const { operation, event, scope, name, duration } = payload
  return `[${formatTime(time)}] [F|${scope}] ${operation} ${name} | ${event}${formatDuration(
    duration
  )}`
}

function formatTestLog(time: number, payload: TestLogPayload): string {
  const { label, desc, ancestors, fixtures, event, duration } = payload
  const testPath = [ancestors.join(' -> '), desc].join(' -> ')
  return `[${formatTime(time)}] [ ${label} ] ${testPath} <${fixtures.join(
    ', '
  )}> | ${event}${formatDuration(duration)}`
}

function formatLog(log: LogPayload): string {
  const { time, type } = log
  if (type === 'fixture') {
    return formatFixtureLog(time, log.payload as FixtureLogPayload)
  } else {
    return formatTestLog(time, log.payload as TestLogPayload)
  }
}

export abstract class Logger {
  public enabled: boolean

  constructor() {
    this.enabled = process.env.FI_LOGGING === '1' || process.env.FI_LOGGING === 'true'
  }

  public abstract fixtureLog(
    operation: Operation,
    event: LogEvent,
    scope: Scope,
    name: string
  ): void

  public abstract functionLog(
    label: Label,
    desc: string,
    ancestors: string[],
    fixtures: Record<string, any>,
    event: LogEvent
  ): void
}

export class LocalLogger extends Logger {
  public startTime: number | undefined
  public fixtureTimestamps: Record<string, Record<string, number>>
  public funcTimestamps: Record<string, number>

  constructor(public logs: [number, LogPayload][] = []) {
    super()

    this.logs = logs
    this.startTime = undefined
    this.fixtureTimestamps = { SETUP: {}, TEARDOWN: {} }
    this.funcTimestamps = {}
  }

  public start(): void {
    this.startTime = microtime.now()
  }

  public fixtureLog(operation: Operation, event: LogEvent, scope: Scope, name: string): void {
    if (!this.enabled) return

    const time = microtime.now()
    let duration = 0
    if (event === LogEvent.Start) {
      this.fixtureTimestamps[operationStr(operation)][name] = time
    } else {
      duration = time - this.fixtureTimestamps[operationStr(operation)][name]
    }
    this.logs.push([
      time,
      {
        time: time - this.startTime!,
        type: 'fixture',
        payload: {
          operation: operationStr(operation),
          event: logEventStr(event),
          scope: scopeStr(scope),
          name,
          duration
        }
      }
    ])
  }

  public functionLog(
    label: Label,
    desc: string,
    ancestors: string[],
    fixtures: Record<string, any>,
    event: LogEvent
  ): void {
    if (!this.enabled) return

    const time = microtime.now()
    const testPath = [ancestors.join(' -> '), desc].join(' -> ')
    let duration = 0
    if (event === LogEvent.Start) {
      this.funcTimestamps[testPath] = time
    } else {
      duration = time - this.funcTimestamps[testPath]
    }
    this.logs.push([
      time,
      {
        time: time - this.startTime!,
        type: 'function',
        payload: {
          label: labelStr(label),
          desc,
          ancestors,
          fixtures,
          event: logEventStr(event),
          duration
        }
      }
    ])
  }

  private sort(): LogPayload[] {
    return this.logs.sort((x, y) => x[0] - y[0]).map(x => x[1])
  }

  public writeAll(writeFn = console.log): void {
    writeFn('--- Fixture Log ---')
    this.sort().forEach((log: LogPayload) => {
      writeFn(`${formatLog(log)}`)
    })
    writeFn('-------------------')
  }
}

export class RemoteLogger extends Logger {
  public fixtureLog(operation: Operation, event: LogEvent, scope: Scope, name: string): void {
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

  public functionLog(
    label: Label,
    desc: string,
    ancestors: string[],
    fixtures: Record<string, any>,
    event: LogEvent
  ): void {
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
