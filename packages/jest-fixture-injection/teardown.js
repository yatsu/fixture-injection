const ipc = require('node-ipc')

const IPC_SERVER_ID = 'fixture-injection-server'
const IPC_CLIENT_ID = 'fixture-injection-client'

function teardown() {
  return new Promise((resolve) => {
    ipc.config.id = IPC_CLIENT_ID
    ipc.config.silent = true
    ipc.connectTo(IPC_SERVER_ID, () => {
      ipc.of[IPC_SERVER_ID].on('connect', () => {
        ipc.of[IPC_SERVER_ID].emit('teardown')
        ipc.disconnect(IPC_SERVER_ID)
      })
      ipc.of[IPC_SERVER_ID].on('disconnect', () => {
        resolve()
      })
    })
  })
}

module.exports = teardown
