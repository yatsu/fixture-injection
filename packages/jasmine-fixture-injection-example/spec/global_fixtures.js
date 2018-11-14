const serverPort = 3100

const server = async (provide, serverPort) => {
  await provide(serverPort)
}

module.exports = {
  serverPort,
  server
}
