const driver = require('bigchaindb-driver')
const config = require('modules/config')
const logger = require('modules/logger')
const aesjs = require('aes-js')
const conn = global.bigchaindb_connection
const memstore = global.memstore

let Bigchaindb = {}

Bigchaindb.makeCreateTransaction = async function (claim, type, private_key, public_key) {
    let obj = {}
    // Example 128-bit. Need revision 192 or 256. Generated or derived
    var nonce = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    obj.nonce_hex = aesjs.utils.hex.fromBytes(nonce)
    var claim_b = aesjs.utils.utf8.toBytes(claim)
    var aesCtr = new aesjs.ModeOfOperation.ctr(nonce) // optional param new aesjs.Counter(1)
    var claim_enc = aesCtr.encrypt(claim_b)
    obj.claim_hex = aesjs.utils.hex.fromBytes(claim_enc)
    logger.info("Encrypted Credit Data: " + obj.claim_hex)

    var tx = driver.Transaction.makeCreateTransaction(
        { schema: 'business', type: type, claim: obj.claim_hex, nonce: obj.nonce_hex },     //data
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
    logger.info('sign_id' + txSigned.id)
    obj.sign_id = txSigned.id
    memstore.set(txSigned.id, txSigned)
    // alternatives are async postTransaction() and postTransactionSync()
    try {
        let retrievedTx = await conn.postTransactionCommit(txSigned)
        logger.info(`Transaction: ${retrievedTx.id} accepted`)
        obj.txn_id = retrievedTx.id
    } catch (ex) {
        obj.txn_id = ex.message
    }
    // USE FOR TRIALS
    // Prototype code for decryption of data
    var claim_b2 = aesjs.utils.hex.toBytes(obj.claim_hex);
    var aesCtr = new aesjs.ModeOfOperation.ctr(nonce);      //assumes counter is 1
    var claim_dec = aesCtr.decrypt(claim_b2);
    var claim_txt = aesjs.utils.utf8.fromBytes(claim_dec);
    logger.info("Decrypted Credit Data: " + claim_txt);

    return obj
}

Bigchaindb.generateKeyPair = async function (claim, type) {
    let merchant = new driver.Ed25519Keypair();
    logger.info("Bigchaindb.generateKeyPairs:: new key pair generated");
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
    logger.info('Performing transfer: ', txSigned.id)
    obj.sign_id = txSigned.id
    memstore.set(txSigned.id, txSigned)
    try {
        let retrievedTx = await conn.postTransactionCommit(txSigned)
        logger.info(`Transaction: ${retrievedTx.id} accepted`)
        obj.txn_id = retrievedTx.id
    } catch (ex) {
        obj.txn_id = ex.message
    }

    return obj
}

Bigchaindb.search = async function (public_key) {
    const listTxn = await conn.listOutputs(public_key)
    return listTxn
}

Bigchaindb.getTransaction = async function (transaction_id) {
    const txn = await conn.getTransaction(transaction_id)
    console.log(txn)
    return txn
}

module.exports = Bigchaindb