'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const TxDepositsrchema = new Schema({
	date: { type: Date, default: Date.now() },
	txid: { type: String , default: ""},
	type: { type: String , default: ""},
	username: { type: String , default: ""},
	amount: { type: Number , default: 0},
    
});



var TxDeposit = mongoose.model('TxDeposit', TxDepositsrchema);
module.exports = TxDeposit;