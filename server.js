const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
// const session = require('express-session')
const cors = require('cors')
global.__basedir = __dirname
const logger = require('modules/logger')
const config = require('modules/config')

const requestId = require('express-request-id')()
const responseTime = require('response-time')

const driver = require('bigchaindb-driver')
const memstore = require('memstore').Store

/**
 * Initialize
 */
const app = express()
const env = app.get('env') || 'development'

global.bigchaindb_connection = new driver.Connection(config.API_PATH, {
    app_id: config.APP_ID,
    app_key: config.APP_KEY
})

global.memstore = new memstore()

/**
 * Config middleware
 */

app.use(helmet())
app.disable('x-powered-by')
app.use(requestId)
app.use(responseTime())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true,
}))

/**
 * Router
 */
app.use('/', require('./routers/admin.routes'))

// Error Handling
// (should be last, after other app.use)
app.use((err, req, res, next) => {
    logger.fatal(`Internal server error - request-id: ${req.id} - Error: ${err.message}`)
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    })
})

/**
 * Run server
 */
app.listen(config.PORT, () => {
    logger.info(`Credible Api is listening on host: ${config.HOST} and port: ${config.PORT}`)
})