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
    let claim = req.body.claim;
    let type = req.body.type;
    let private_key = req.body.private_key;
    let public_key = req.body.public_key;
    let data = await bigchaindb.makeCreateTransaction(claim, type, private_key, public_key);
    res.json(data);
}

bigchainController.generateKeyPair = async function (req, res) {
    logger.trace('bigchain.controller::generateKeyPair:CALL');
    res.json(await bigchaindb.generateKeyPair());
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

    let sign_id = req.body.sign_id;
    let from_private_key = req.body.from_private_key;
    let to_public_key = req.body.to_public_key;

    let txSigned = memstore.get(sign_id);

    if (txSigned == undefined) {
        return res.status(404).send({ message: `Sign id ${sign_id} not found` });
    }

    let data = await bigchaindb.makeTransferTransaction(txSigned, from_private_key, to_public_key);
    res.json(data);
}

bigchainController.search = async function (req, res) {
    logger.trace('bigchain.controller::search:CALL');

    let schema = Joi.object().keys({
        public_key: Joi.string().required(),
    });
    logger.info('req.query: ' + JSON.stringify(req.query));

    const validater = Joi.validate(req.query, schema);
    if (validater.error) {
        logger.trace('bigchain.controller::search:' + validater.error);
        return res.status(400).send({ message: validater.error.details[0].message });
    }

    let public_key = req.query.public_key;

    let data = await bigchaindb.search(public_key);
    res.json(data);
}

bigchainController.getTransaction = async function (req, res) {
    logger.trace('bigchain.controller::getTransaction:CALL');

    let schema = Joi.object().keys({
        transaction_id: Joi.string().required(),
    });
    logger.info('req.query: ' + JSON.stringify(req.query));

    const validater = Joi.validate(req.query, schema);
    if (validater.error) {
        logger.trace('bigchain.controller::getTransaction:' + validater.error);
        return res.status(400).send({ message: validater.error.details[0].message });
    }

    let transaction_id = req.query.transaction_id;

    let data = await bigchaindb.getTransaction(transaction_id);
    res.json(data);
}

bigchainController.getTokenBalance = async function (req, res) {
    logger.trace('bigchain.controller::getTokenBalance:CALL');

    let schema = Joi.object().keys({
        public_key: Joi.string().required(),
    });
    logger.info('req.query: ' + JSON.stringify(req.query));

    const validater = Joi.validate(req.query, schema);
    if (validater.error) {
        logger.trace('bigchain.controller::getTokenBalance:' + validater.error);
        return res.status(400).send({ message: validater.error.details[0].message });
    }

    let public_key = req.query.public_key;

    let data = await bigchaindb.getTokenBalance(public_key);
    res.json(data);
}

bigchainController.getValidators = async function (req, res) {
    logger.trace('bigchain.controller::getValidators:CALL');

    let data = await bigchaindb.getValidators();
    res.json(data);
}

bigchainController.getVersion = async function (req, res) {
    logger.trace('bigchain.controller::getVersion:CALL');

    let version = await bigchaindb.getVersion();
    res.json({
        version: version,
        timestamp: new Date().getTime()
    });
}

bigchainController.searchMetadata = async function (req, res) {
    logger.trace('bigchain.controller::searchMetadata:CALL');

    let schema = Joi.object().keys({
        metadata: Joi.string().required(),
    });
    logger.info('req.query: ' + JSON.stringify(req.query));

    const validater = Joi.validate(req.query, schema);
    if (validater.error) {
        logger.trace('bigchain.controller::searchMetadata:' + validater.error);
        return res.status(400).send({ message: validater.error.details[0].message });
    }

    let metadata = req.query.metadata;

    let data = await bigchaindb.searchMetadata(metadata);
    res.json(data);
}

module.exports = bigchainController

