const driver = require('bigchaindb-driver')
const config = require('modules/config')
const logger = require('modules/logger')
const aesjs = require('aes-js')
const conn = global.bigchaindb_connection

let Bigchaindb = {}

Bigchaindb.makeCreateTransaction = async function (claim, type) {
    let obj = {}
    var key_private = config.PRIVATE_KEY
    var key_public = config.PUBLIC_KEY
    // Example 128-bit. Need revision 192 or 256. Generated or derived
    var nonce = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    obj.nonce_hex = aesjs.utils.hex.fromBytes(nonce)
    var claim_b = aesjs.utils.utf8.toBytes(claim)
    var aesCtr = new aesjs.ModeOfOperation.ctr(nonce)    //optional param new aesjs.Counter(1)
    var claim_enc = aesCtr.encrypt(claim_b)
    obj.claim_hex = aesjs.utils.hex.fromBytes(claim_enc)
    logger.info("Encrypted Credit Data: " + obj.claim_hex)

    var tx = driver.Transaction.makeCreateTransaction(
        { schema: 'business', type: type, claim: obj.claim_hex, nonce: obj.nonce_hex },     //data
        { oid: '.1.3.6.1.4.1.46744.1' },    //meta-data
        [driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(key_public))
        ],
        key_public
    )
    /*tx.id = sha3.sha3_256
        .create()
        .update(driver.Transaction.serializeTransactionIntoCanonicalString(tx))
        .hex()*/
    let txSigned = driver.Transaction.signTransaction(tx, key_private)
    logger.info('sign_id' + txSigned.id)
    obj.sign_id = txSigned.id
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

module.exports = Bigchaindb