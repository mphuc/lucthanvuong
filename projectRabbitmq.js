'use strict'
const mongoose = require('mongoose');
const User = require('./models/user');
const service = require('./services');
const moment = require('moment');
const bitcoin = require('bitcoin');
var config = require('./config');
const amqp = require('amqplib/callback_api');
const Deposit = require('./models/deposit');
const Withdraw = require('./models/withdraw');
var _ = require('lodash');

const COINClient = new bitcoin.Client({
	host: config.COIN.host,
	port: config.COIN.port,
	user: config.COIN.user,
	pass: config.COIN.pass,
	timeout: config.COIN.timeout
});

const BTCClient = new bitcoin.Client({
	host: config.BTC.host,
	port: config.BTC.port,
	user: config.BTC.user,
	pass: config.BTC.pass,
	timeout: config.BTC.timeout
});

var getTransaction = function(client , tx, callback){
	client.getTransaction(tx, function (err, transaction) {
		err || !transaction ? callback(null) : callback(transaction);
	})
}

var update_balace_coin = function(amount_coin,user_id,callback){
	User.findById(user_id, function(err, user) {
		var coin_balance;
		var new_ast_balance;
		var query;
		var data_update;
		!err && user ? (
			coin_balance = parseFloat(user.balance.coin_wallet.available),
			new_ast_balance = parseFloat(coin_balance + amount_coin),
			query = {_id:user_id},
			data_update = {
				$set : {
					'balance.coin_wallet.available': parseFloat(new_ast_balance)
				}
			},
			User.update(query, data_update, function(err, UsersUpdate){
				err ? callback(false) : callback(true);
			})
		) : callback(false)
	})
}

var checkTxdepo = function(name, tx, callback){
	Deposit.count({
		$and : [
        {'txid' : tx}, 
        { 'type': name }]
    }, (err, sum) => {
    	err || sum > 0 ? callback(false) : callback(true);
	});
}

var newDepositObj = function(data, amount, address, tx ,name){
	var today = moment();
	return new Deposit({
		"user_id" : data._id,
		"amount" : parseFloat(amount)*100000000,
		"confirm" : 0,
		"username" : data.displayName,
		"wallet" : address,
		"txid" : tx,
		"type" : name,
		"date" : moment(today).format(),
		"status" : 0
	})
}

var getNameCoin = function(name, address){
	if (name === 'LEC') return {'balance.coin_wallet.cryptoaddress' : address};
	if (name === 'BTC') return {'balance.bitcoin_wallet.cryptoaddress': address};
	return {'balance.dashcoin_wallet.cryptoaddress' : 'sdkjafhkjarthyiuertyiury'}
}

var fnFindAddress = function(name, amount, address,tx ,callback){
	console.log(name,address);	
	User.findOne(
		getNameCoin(name,address)
	,function (err, data) {

		err || !data ? callback(false) : (
			newDepositObj(data, amount, address, tx, name).save(( err, DepositStored)=>{
				err ? callback(false) : callback(true)
			})
		);
	});
}

var process_deposit = function(name, client, tx ,callback){
	var details = null;
	getTransaction (client, tx, function(transaction){
		var details;
		transaction !== null ? (
			details = transaction.details.filter(function (self) {
			    return self.category === 'receive'
			}),
			details.length > 0 ? (
				checkTxdepo(name, tx, function(check){
					console.log(check);
					check ? _.forEach(details, function(value,index ){
						console.log(value.amount , value.address);
						fnFindAddress(name, value.amount, value.address, tx, function(cb){
							details.length - 1 === index && callback(true);
						})
					}) : callback(false);
				})
			) : callback(false)
		) : callback(false)
	});		
};

var getUser = function(id_user,callback){
	User.findById(id_user, function(err, user) {
		err || !user ? callback(null) : callback(user);
	});
}

var Create_Withdraw = function(name,user,amount,address,fee,callback){
	let newWithdraw = new Withdraw();	
	var today = moment();
	newWithdraw.amount = amount;
	newWithdraw.user_id = user._id;
	newWithdraw.status = 0;
	newWithdraw.username = user.displayName;
	newWithdraw.wallet = address;
	newWithdraw.txid = '';
	newWithdraw.fee = fee;
	newWithdraw.date = moment(today).format();
	newWithdraw.type = name;
	newWithdraw.save((err, WithdrawStored)=>{
		err ? callback(false) : callback(true);
	});
}

var update_balace = function(name , new_ast_balance,user_id,callback){

	var obj = null;
	if (name === 'BTC') obj =  { 'balance.bitcoin_wallet.available': parseFloat(new_ast_balance) }
	if (name === 'BCH') obj =  {'balance.bitcoincash_wallet.available' : parseFloat(new_ast_balance)};
	if (name === 'BCC') obj = {'balance.bitconnect_wallet.available' : parseFloat(new_ast_balance)};
	if (name === 'LTC') obj = {'balance.litecoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'LEC') obj = {'balance.coin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'DASH') obj = {'balance.dashcoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'XVG') obj = {'balance.verge_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'BTG') obj = {'balance.bitcoingold_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'XZC') obj = {'balance.zcoin_wallet.available': parseFloat(new_ast_balance)};
	if (name === 'ETH') obj = {'balance.ethereum_wallet.available': parseFloat(new_ast_balance)};
	User.update({ _id :user_id }, { $set : obj }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}

function process_withdraw(name, string_receiverabit,callback){

	var build_String = string_receiverabit.split("_");
	var id_user = build_String[0];
	var amount = parseFloat(build_String[1]);
	var address = build_String[2];
	var numWallet = null;
	var free = 0

	getUser(id_user,function(user){

		if (user) {
			if (name === 'BTC') { numWallet = user.balance.bitcoin_wallet.available ,  free = 100000  };
			if (name === 'BCH') { numWallet = user.balance.bitcoincash_wallet.available ,  free = 100000 };
			if (name === 'BCC') { numWallet = user.balance.bitconnect_wallet.available ,  free = 100000 };
			if (name === 'LTC') { numWallet = user.balance.litecoin_wallet.available ,  free = 1000000 };
			if (name === 'LEC') { numWallet = user.balance.coin_wallet.available ,  free = 100000 };
			if (name === 'XVG') { numWallet = user.balance.verge_wallet.available ,  free = 20000000 };
			if (name === 'DASH') { numWallet = user.balance.dashcoin_wallet.available ,  free = 200000 };
			if (name === 'BTG') { numWallet = user.balance.bitcoingold_wallet.available ,  free = 100000 };
			if (name === 'XZC') { numWallet = user.balance.zcoin_wallet.available ,  free = 2000000 };
			if (name === 'ETH') { numWallet = user.balance.ethereum_wallet.available ,  free = 200000 };
			var ast_balance = parseFloat(numWallet);
			if (parseFloat(ast_balance) < parseFloat(amount)+ parseFloat(free)) {


				callback(false);
			}
			else{
				Create_Withdraw(name,user,amount,address,free,function(cb){
					if (cb){
						var new_ast_balance = (parseFloat(ast_balance) - parseFloat(amount) - parseFloat(free)).toFixed(8);
						update_balace(name, new_ast_balance,user._id,function(calb){
							calb ? callback(true) : callback(false);
						})
					}
					else{
						callback(false);
					}
				})
			}
		}
		else {
			callback(false);
		}
	});
};

function process_deposit_gmd(tx , callback){
	process_deposit('LEC', COINClient , tx, function(cb){
		cb ? callback(true) : callback(false)
	});
}

function process_deposit_btc(tx , callback){
	process_deposit('BTC', BTCClient , tx, function(cb){
		cb ? callback(true) : callback(false)
	});
}

module.exports = {
	process_deposit_gmd,
	process_deposit_btc,
	process_withdraw
}