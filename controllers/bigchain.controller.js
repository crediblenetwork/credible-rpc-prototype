const Joi = require('joi')
const config = require('modules/config')
const logger = require('modules/logger')
const bigchaindb = require('modules/bigchaindb')
const memstore = global.memstore

let bigchainController = {}

bigchainController.add = async function (req, res) {
    logger.trace('bigchain.controller::add:CALL');

    let schema = Joi.object().keys({
        claim: Joi.string().required(),
        type: Joi.string().required(),
        private_key: Joi.string().required(),
        public_key: Joi.string().required(),
    });
    logger.info('req.body: ' + JSON.stringify(req.body));

    const validater = Joi.validate(req.body, schema);
    if (validater.error) {
        logger.trace('bigchain.controller::add:' + validater.error);
        return res.status(400).send({ message: validater.error.details[0].message });
    }
    let claim = req.body.claim
    let type = req.body.type
    let private_key = req.body.private_key
    let public_key = req.body.public_key
    let data = await bigchaindb.makeCreateTransaction(claim, type, private_key, public_key)
    res.json(data)
}

bigchainController.generateKeyPair = async function (req, res) {
    logger.trace('bigchain.controller::generateKeyPair:CALL');
    res.json(await bigchaindb.generateKeyPair())
}

bigchainController.transfer = async function (req, res) {
    logger.trace('bigchain.controller::transfer:CALL');

    let schema = Joi.object().keys({
        sign_id: Joi.string().required(),
        from_private_key: Joi.string().required(),
        to_public_key: Joi.string().required(),
    });
    logger.info('req.body: ' + JSON.stringify(req.body));

    const validater = Joi.validate(req.body, schema);
    if (validater.error) {
        logger.trace('bigchain.controller::transfer:' + validater.error);
        return res.status(400).send({ message: validater.error.details[0].message });
    }

    let sign_id = req.body.sign_id
    let from_private_key = req.body.from_private_key
    let to_public_key = req.body.to_public_key

    let txSigned = memstore.get(sign_id)

    if (txSigned == undefined) {
        return res.status(404).send({ message: `Sign id ${sign_id} not found` });
    }

    let data = await bigchaindb.makeTransferTransaction(txSigned, from_private_key, to_public_key)
    res.json(data)
}

module.exports = bigchainController

