const driver = require('bigchaindb-driver')
const config = require('modules/config')
const logger = require('modules/logger')
const baseRequest = require('modules/baseRequest')
const aesjs = require('aes-js')
const conn = global.bigchaindb_connection
const memstore = global.memstore

let Bigchaindb = {}

Bigchaindb.makeCreateTransaction = async function (claim, type, private_key, public_key) {
    let obj = {}
    // Example 128-bit. Need revision 192 or 256. Generated or derived
    let nonce = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    obj.nonce_hex = aesjs.utils.hex.fromBytes(nonce)
    obj.claim = claim

    var tx = driver.Transaction.makeCreateTransaction(
        { schema: 'business', type: type, claim: obj.claim, nonce: obj.nonce_hex },     //data
        { oid: '.1.3.6.1.4.1.46744.1' },    //meta-data
        [driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(public_key))
        ],
        public_key
    )
    /*tx.id = sha3.sha3_256
        .create()
        .update(driver.Transaction.serializeTransactionIntoCanonicalString(tx))
        .hex()*/
    let txSigned = driver.Transaction.signTransaction(tx, private_key)
    logger.info('Bigchaindb::makeCreateTransaction:sign_id:' + txSigned.id)
    obj.sign_id = txSigned.id
    memstore.set(txSigned.id, txSigned)
    // alternatives are async postTransaction() and postTransactionSync()
    try {
        let retrievedTx = await conn.postTransactionCommit(txSigned)
        logger.info(`Bigchaindb::makeCreateTransaction:Transaction: ${retrievedTx.id} accepted`)
        obj.txn_id = retrievedTx.id
    } catch (ex) {
        logger.error(`Bigchaindb::makeCreateTransaction:error:${ex.message}`)
        obj.txn_id = `Transaction create:error`
    }

    return obj
}

Bigchaindb.generateKeyPair = async function (claim, type) {
    let merchant = new driver.Ed25519Keypair();
    logger.info("Bigchaindb::generateKeyPairs:new key pair generated");
    return {
        private_key: merchant.privateKey,
        public_key: merchant.publicKey
    }
}

Bigchaindb.makeTransferTransaction = async function (txSigned, from_private_key, to_public_key) {
    let obj = {}
    const tx = driver.Transaction.makeTransferTransaction(
        [{ tx: txSigned, output_index: 0 }],
        [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(to_public_key))],
        // metadata
        { update: 'attestation' }
    )
    txSigned = driver.Transaction.signTransaction(tx, from_private_key)
    logger.info('Bigchaindb::makeTransferTransaction:Performing transfer:', txSigned.id)
    obj.sign_id = txSigned.id
    memstore.set(txSigned.id, txSigned)
    try {
        let retrievedTx = await conn.postTransactionCommit(txSigned)
        logger.info(`Bigchaindb.makeTransferTransaction:Transaction:${retrievedTx.id} accepted`)
        obj.txn_id = retrievedTx.id
    } catch (ex) {
        logger.error(`Bigchaindb.makeTransferTransaction:error: ${ex.message}`)
        obj.txn_id = `Transaction transfer:error`
    }

    return obj
}

Bigchaindb.search = async function (public_key) {
    let data = await conn.listOutputs(public_key)
    logger.info(`Bigchinadb::search:Public key: ${public_key} has: ${data.length} transactions`)
    let listTxn = await Bigchaindb.filterWalletTransaction(data, "transaction_id")
    logger.info(`Bigchinadb::search:Public key: ${public_key} has: ${listTxn.length} wallet transactions`)
    return listTxn
}

Bigchaindb.getTransaction = async function (transaction_id) {
    const txn = await conn.getTransaction(transaction_id)
    return txn
}

Bigchaindb.getTokenBalance = async function (public_key) {
    let txns = await conn.listOutputs(public_key, false);
    let amount = 0;
    let txnAdd = [];
    let txnMinus = [];
    for (let i = 0; i < txns.length; i++) {
        let txn = await conn.getTransaction(txns[i].transaction_id);
        if (txn === null) {
            continue;
        }

        if (txn.operation === 'CREATE' && txn.asset.data.token === 'PESA') {
            txnAdd.push(...txn.outputs.filter((item, idx) => { return item.public_keys[0] === public_key && idx === 0 }));
        } else if (txn.operation === 'TRANSFER') {
            txnMinus.push(...txn.outputs.filter((item, idx) => { return item.public_keys[0] !== public_key && idx !== 0 }));
            txnAdd.push(...txn.outputs.filter((item, idx) => { return item.public_keys[0] === public_key && idx !== 0 }));
        }

        amount = txnAdd.reduce((total, currentValue) => { return total + parseInt(currentValue.amount) }, 0) - txnMinus.reduce((total, currentValue) => { return total + parseInt(currentValue.amount) }, 0)
    }
    return amount;
}

Bigchaindb.getValidators = async function () {
    let [error, data] = await baseRequest.call(`${config.API_URL}${config.API_PATH}/validators`);
    if (error) {
        logger.error(`Bigchinadb::getValidators:error: ${error}`);
        return [];
    }
    return data;
}

Bigchaindb.getVersion = async function () {
    let [error, data] = await baseRequest.call(`${config.API_URL}`);
    if (error) {
        logger.error(`Bigchinadb::getVersion:error: ${error}`);
        return null;
    }
    return data.version;
}

Bigchaindb.searchMetadata = async function (metadata) {
    let data = await conn.searchMetadata(metadata)
    logger.info(`Bigchaindb::searchMetadata:Meta data: ${metadata} has: ${data.length} transactions`)
    let listTxn = await Bigchaindb.filterWalletTransaction(data, "id")
    logger.info(`Bigchaindb::searchMetadata:Meta data: ${metadata} has: ${listTxn.length} wallet transactions`)
    return listTxn
}

Bigchaindb.filterWalletTransaction = async function (txns, col) {
    let walletTranactions = []
    let txn;
    for (let i = 0; i < txns.length; i++) {
        txn = await conn.getTransaction(txns[i][col]);
        if (txn === null) continue;
        if (txn.asset.id === config.PESA_TOKEN_ASSET_ID) continue;

        walletTranactions.push(txns[i]);
    }
    return walletTranactions;
}

module.exports = Bigchaindb