const fs = require('fs')
const dotenv = require('dotenv')

let config = {
    HOST: "http://localhost:3000",
    PORT: 3000,
    USERNAME: "SmartPesa",
    PASSWORD: "Password",
    LOGGER_LEVEL: "all",
    LOGGER_LAYOUT_PATTERN: "%d{MM-dd-yyyy} -%t -%x: %m%n",
    LOGGER_ENABLE_CONSOLE_LOG: true,
    LOGGER_ENABLE_FILE_LOG: true,
    LOGGER_FILE_LOG_PATH: null,
    LOGGER_FILE_LOG_NAME: "api.log",
    LOGGER_FILE_LOG_MAX_SIZE: 10485760,
    LOGGER_FILE_LOG_BACKUP_NUMBERS: 10,
    API_URL: "https://test3.bigchaindb.com",
    API_PATH: "/api/v1",
    APP_ID:"2c148e17",
    APP_KEY: "514121307804d7492651d3cba7fd02e4",

};

let result = dotenv.config()
let dotenvConfig = result.error ? {} : result.parsed

Object.keys(dotenvConfig).forEach((key) => {
    if (config[key] === undefined) console.warn(`Key ${key} unused`);

    switch (typeof config[key]) {
        case "boolean":
            config[key] = dotenvConfig[key] === "true"
            break

        case "number":
            config[key] = Number(dotenvConfig[key])
            break

        case "object":
            config[key] = JSON.parse(dotenvConfig[key])
            break

        default:
            config[key] = dotenvConfig[key]
            break
    }
});

module.exports = config
