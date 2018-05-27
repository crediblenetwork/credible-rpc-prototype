var express = require('express')
const wrapAA = require('modules/wrapAsyncAwait')
var router = wrapAA(express.Router())

var auth = require('./../controllers/auth.controller')
var bigchain = require('./../controllers/bigchain.controller')

router.post('/add', auth.basicAuthen, bigchain.add)
router.get('/generatekeypair', auth.basicAuthen, bigchain.generateKeyPair)
router.post('/transfer', auth.basicAuthen, bigchain.transfer)

module.exports = router