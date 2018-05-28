const config = require('modules/config')
const logger = require('modules/logger')

let authController = {}

authController.basicAuthen = function (req, res, next) {
    let auth = req.headers['authorization'];  // auth is in base64(username:password)  so we need to decode the base64
    logger.info("Authorization Header is: ", auth);
    
    if (!auth) {
        return res.status(400).send({ message: "Missing authentication info" })
    }

    let data = auth.split(' ');

    let buf = new Buffer(data[1], 'base64');
    let plain_auth = buf.toString();

    logger.info("Decoded Authorization ", plain_auth);
    var creds = plain_auth.split(':');
    var username = creds[0];
    var password = creds[1];

    if (username !== config.USERNAME || password !== config.PASSWORD) {
        return res.status(401).send({ message: "Unauthorized" })
    }

    return next()
}

module.exports = authController

