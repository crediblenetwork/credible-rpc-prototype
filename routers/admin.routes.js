var express = require('express')
const wrapAA = require('modules/wrapAsyncAwait')
var router = wrapAA(express.Router())

var auth = require('./../controllers/auth.controller')
var bigchain = require('./../controllers/bigchain.controller')

router.post('/add', auth.basicAuthen, bigchain.add)

module.exports = router