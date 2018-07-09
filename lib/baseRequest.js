const config = require('modules/config')
const logger = require('modules/logger')
const axios = require('axios')

let BaseRequest = {}

BaseRequest.call = async function (url, method = 'GET', data = {}) {
    let options = {
        method: method,
        url: url,
        headers: {
            'cache-control': 'no-cache',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        data: data,
        json: false
    }
    try {
        let response = await axios(options)
        return [null, response.data]

    } catch (error) {
        logger.warn(`Request error with url: ${url} and Error: ${error.message}`)
        if (error.response != null) {
            return [error.response.data.message != null ? error.response.data.message : error.response.data]
        }
        return [error.message]
    }
}

module.exports = BaseRequest