const Joi = require('joi')
const config = require('modules/config')
const logger = require('modules/logger')
const bigchaindb = require('modules/bigchaindb')

let bigchainController = {}

bigchainController.add = async function(req, res) {    
    logger.trace('bigchain.controller::add:CALL');

    let schema = Joi.object().keys({
        claim: Joi.string().required(),
        type: Joi.string().required(),
    });
    logger.info('req.body: ' + JSON.stringify(req.body));

    const validater = Joi.validate(req.body, schema);
    if (validater.error) {
        logger.trace('bigchain.controller::add:' + validater.error);
        return res.status(400).send({ message: validater.error.details[0].message });
    }
    let claim = req.body.claim
    let type = req.body.type
    let data = await bigchaindb.makeCreateTransaction(claim, type)
    res.json(data)
}

module.exports = bigchainController

