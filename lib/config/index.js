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
    LOGGER_ENABLE_HTTP_LOG: false,
    LOGGER_FILE_LOG_PATH: null,
    LOGGER_FILE_LOG_NAME: "api.log",
    LOGGER_FILE_LOG_MAX_SIZE: 10485760,
    LOGGER_FILE_LOG_BACKUP_NUMBERS: 10,
    LOGGER_HTTP_LOG_URL: "",
    API_PATH: "https://test3.bigchaindb.com/api/v1/",
    APP_ID:"2c148e17",
    APP_KEY: "514121307804d7492651d3cba7fd02e4",
    PRIVATE_KEY: "8p8sk3ZQ2XKwp7PTSxDSC99j33pdo48Z8g6AJE5fF5An",
    PUBLIC_KEY: "9U95xGb6E2hendFE2F4aGvX5vrepYrht8LFjkVyaazdM"

};

const result = dotenv.config()
let dotenvConfig = result.error ? {} : result.parsed

let dotenvParse = {};
if (fs.existsSync('.env.' + process.env.NODE_ENV)) {
    dotenvParse = dotenv.parse(fs.readFileSync('.env.' + process.env.NODE_ENV));
}

const dotenvEnvConfig = Object.assign(dotenvConfig, dotenvParse)

Object.keys(dotenvEnvConfig).forEach((key) => {
    if (config[key] === undefined) console.warn(`Key ${key} does not belong to config`);

    switch (typeof config[key]) {
        case "boolean":
            config[key] = Boolean(dotenvEnvConfig[key])
            break

        case "number":
            config[key] = Number(dotenvEnvConfig[key])
            break

        case "object":
            config[key] = JSON.parse(dotenvEnvConfig[key])
            break

        default:
            config[key] = dotenvEnvConfig[key]
            break
    }
});

module.exports = config
