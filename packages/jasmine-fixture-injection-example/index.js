const express = require('express')
const hello = require('./hello')

const app = express()

app.get('/', (req, res) => res.send(hello()))

const port = parseInt(process.env.PORT || '3000', 10)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
