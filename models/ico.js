'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Icochema = new Schema({
	date: { type: Date, default: Date.now() },
	amount_coin: String,
    amount_btc: String,
	address_btc: String,
    txid: String,
    receive: String,
    status: { type: String, default: '0' },
    txid: String,
    user_id : String,
    
});
var Ico = mongoose.model('Ico', Icochema);
module.exports = Ico;