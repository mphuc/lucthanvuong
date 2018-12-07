'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const Invest = require('../models/invest');
const service = require('../services');
const moment = require('moment');
const nodemailer = require('nodemailer');
const Ticker = require('../models/ticker');
var _ = require('lodash');
const bitcoin = require('bitcoin');
const Withdraw = require('../models/withdraw');
const Deposit = require('../models/deposit');
const bcrypt = require('bcrypt-nodejs');

var sendpulse = require("sendpulse-api");
var sendpulse = require("../models/sendpulse.js");
var config = require('../config'); 
var speakeasy = require('speakeasy');
const amqp = require('amqplib/callback_api');
var API_USER_ID= 'e0690653db25307c9e049d9eb26e6365';
var API_SECRET= '3d7ebbb8a236cce656f8042248fc536e';
var TOKEN_STORAGE="/tmp/";
const sendRabimq = require('../rabbit_comfim');


sendpulse.init(API_USER_ID,API_SECRET,TOKEN_STORAGE);

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

function get_pedding_balance(user_id,callback)
{
	var data = {};
	data.lec = 0;
	data.btc = 0;
	data.ltc = 0;
	data.dash = 0;
	data.bch = 0;
	data.bcc = 0;
	data.xvg = 0;
	data.btg = 0;
	data.xzc = 0;
	data.eth = 0;
	Deposit.find({$and : [{'user_id' : user_id}, { 'status': 0 }]},(err,result)=>{
		result.forEach(function(item){
			if (item.type == 'LEC') data.lec += parseFloat(item.amount);
			if (item.type == 'LTC') data.ltc += parseFloat(item.amount);
			if (item.type == 'BTC') data.btc += parseFloat(item.amount);
			if (item.type == 'DASH') data.dash += parseFloat(item.amount);
			if (item.type == 'BCH') data.bch += parseFloat(item.amount);
			if (item.type == 'BCC') data.bcc += parseFloat(item.amount);
			if (item.type == 'XVG') data.xvg += parseFloat(item.amount);
			if (item.type == 'BTG') data.btg += parseFloat(item.amount);
			if (item.type == 'XZC') data.xzc += parseFloat(item.amount);
			if (item.type == 'ETH') data.eth += parseFloat(item.amount);
		});
		callback(data);
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
	if (name === 'ETH') obj = {'balance.ethereum_wallet.available': parseFloat(new_ast_balance)};
	User.update({ _id :user_id }, { $set : obj }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
function Balance(req,res){

	Withdraw.find({'user_id' : req.user._id},(err,result)=>{
		get_pedding_balance(req.user._id,function(data){
			getTicker(function(data_ticker){
				
				res.locals.title = 'Balance';
				res.locals.menu = 'balance';
				res.locals.user = req.user;
				res.locals.withdraw_history = result;
				res.locals.balance = data;
				res.locals.page_balance = true;
				res.locals.price = data_ticker;
				
				res.render('account/balance');
				
			})
		});
	});
}
function getTicker(callback){
	Ticker.findOne({},(err,data_ticker)=>{
		callback(data_ticker);
	});
}

function getWithdraw_user_pendding(req,res){
	Withdraw.find({$and : [{'user_id' : req.user._id}, { 'status': 0 }]},(err,result)=>{
		var new_data_user = [];
		for (var i = result.length - 1; i >= 0; i--) {
			new_data_user.push({
				'date': moment(result[i].date).format('MM/DD/YYYY LT'),
				'amount': (parseFloat(result[i].amount)/100000000).toFixed(8),
				'type': result[i].type,
				'status' : 'Pending',
				'remove_order' : '<button class="remove_order" data-id="'+result[i]._id+'"> <i class="fa fa-times "></i> </button>'

			});
		}
		return res.status(200).send({result: new_data_user});
	});
}

function getDeposit_user_pendding(req,res){
	Deposit.find({$and : [{'user_id' : req.user._id}, { 'status': 0 }]},(err,result)=>{
		var new_data_user = [];
		for (var i = result.length - 1; i >= 0; i--) {
			var status = (result[i].status == 1) ? 'Finish' : 'Cancel';

			var confirms = result[i].type == 'LEC' ? '/1' : '/3';

			var url_exchain = result[i].txid;
			if (result[i].type == 'BTC')
			{
				confirms = "/4";	
				url_exchain = '<a target="_blank" href="https://blockchain.info/tx/'+result[i].txid+'" >'+result[i].txid+'</a>';
			}
			if (result[i].type == 'BCH'){
				confirms = "/4";
				url_exchain = '<a target="_blank" href="https://bccblock.info/tx/'+result[i].txid+'" >'+result[i].txid+'</a>';
			}
			if (result[i].type == 'LTC'){
				confirms = "/6";
				url_exchain = '<a target="_blank" href="https://chainz.cryptoid.info/ltc/'+result[i].txid+'.htm" >'+result[i].txid+'</a>';
			}
			if (result[i].type == 'DASH'){
				confirms = "/6";
				url_exchain = '<a target="_blank" href="https://explorer.dash.org/tx/'+result[i].txid+'" >'+result[i].txid+'</a>';
			}
			if (result[i].type == 'BCC'){
				confirms = "/4";
				url_exchain = '<a target="_blank" href="https://chainz.cryptoid.info/bcc/tx.dws?'+result[i].txid+'.htm" >'+result[i].txid+'</a>';
			}
			if (result[i].type == 'XVG'){
				confirms = "/30";
				url_exchain = '<a target="_blank" href="https://verge-blockchain.info/tx/'+result[i].txid+'">'+result[i].txid+'</a>';
			}
			if (result[i].type == 'BTG'){
				confirms = "/10";
				url_exchain = '<a target="_blank" href="https://btgexplorer.com/tx/'+result[i].txid+'">'+result[i].txid+'</a>';
				
			}
			if (result[i].type == 'XZC'){
				confirms = "/10";
				url_exchain = '<a target="_blank" href="http://explorer.zcoin.io/tx/'+result[i].txid+'">'+result[i].txid+'</a>';
			}
				
			if (result[i].type == 'ETH'){
				confirms = "/6";
				url_exchain = '<a target="_blank" href="https://etherscan.io/tx/0x'+result[i].txid+'">'+result[i].txid+'</a>';
			}

			

			new_data_user.push({
				'date': moment(result[i].date).format('MM/DD/YYYY LT'),
				'amount': (parseFloat(result[i].amount)/100000000).toFixed(8),
				'type': result[i].type,
				'confirm' : result[i].confirm+confirms,
				'txid' : url_exchain

			});
		}

		return res.status(200).send({result: new_data_user});
	});
}

function getWithdraw_user_finish(req,res){
	Withdraw.find({$and : [{'user_id' : req.user._id}, {$or: [{ 'status': 1 },{ 'status': 8 }]}]},(err,result)=>{
		var new_data_user = [];
		for (var i = result.length - 1; i >= 0; i--) {
			var status = (result[i].status == 1) ? 'Finish' : 'Cancel';
			var url_exchain = result[i].txid;
			if (result[i].type == 'BTC')
			{
				
				url_exchain = '<a target="_blank" href="https://blockchain.info/tx/'+result[i].txid+'" >'+result[i].txid+'</a>';
			}
			if (result[i].type == 'BCH'){
				
				url_exchain = '<a target="_blank" href="https://bccblock.info/tx/'+result[i].txid+'" >'+result[i].txid+'</a>';
			}
			if (result[i].type == 'LTC'){
				
				url_exchain = '<a target="_blank" href="https://chainz.cryptoid.info/ltc/'+result[i].txid+'.htm" >'+result[i].txid+'</a>';
			}
			if (result[i].type == 'DASH'){
				
				url_exchain = '<a target="_blank" href="https://explorer.dash.org/tx/'+result[i].txid+'" >'+result[i].txid+'</a>';
			}
			if (result[i].type == 'BCC'){
				
				url_exchain = '<a target="_blank" href="https://chainz.cryptoid.info/bcc/tx.dws?'+result[i].txid+'.htm" >'+result[i].txid+'</a>';
			}
			if (result[i].type == 'XVG'){
				
				url_exchain = '<a target="_blank" href="https://verge-blockchain.info/tx/'+result[i].txid+'">'+result[i].txid+'</a>';
			}
			if (result[i].type == 'BTG'){
				
				url_exchain = '<a target="_blank" href="https://btgexplorer.com/tx/'+result[i].txid+'">'+result[i].txid+'</a>';
				
			}

			if (result[i].type == 'XZC'){
				
				url_exchain = '<a target="_blank" href="http://explorer.zcoin.io/tx/'+result[i].txid+'">'+result[i].txid+'</a>';
			}

			if (result[i].type == 'ETH'){
				
				url_exchain = '<a target="_blank" href="https://etherscan.io/tx/'+result[i].txid+'">'+result[i].txid+'</a>';
			}
			
			new_data_user.push({
				'date': moment(result[i].date).format('MM/DD/YYYY LT'),
				'amount': (parseFloat(result[i].amount)/100000000).toFixed(8),
				'type': result[i].type,
				'status' : status,
				'txid' : url_exchain

			});
		}

		return res.status(200).send({result: new_data_user});
	});
}

function getDeposit_user_finish(req,res){
	Deposit.find({$and : [{'user_id' : req.user._id}, {$or: [{ 'status': 1 },{ 'status': 8 }]}]},(err,result)=>{
		var new_data_user = [];
		for (var i = result.length - 1; i >= 0; i--) {
			var status = (result[i].status == 1) ? 'Finish' : 'Cancel';

			var url_exchain = result[i].txid;
			if (result[i].type == 'BTC')
				url_exchain = '<a target="_blank" href="https://blockchain.info/tx/'+result[i].txid+'" >'+result[i].txid+'</a>';
			if (result[i].type == 'BCH')
				url_exchain = '<a target="_blank" href="https://bccblock.info/tx/'+result[i].txid+'" >'+result[i].txid+'</a>';
			if (result[i].type == 'LTC')
				url_exchain = '<a target="_blank" href="https://chainz.cryptoid.info/ltc/'+result[i].txid+'.htm" >'+result[i].txid+'</a>';
			if (result[i].type == 'DASH')
				url_exchain = '<a target="_blank" href="https://explorer.dash.org/tx/'+result[i].txid+'" >'+result[i].txid+'</a>';
			if (result[i].type == 'BCC')
				url_exchain = '<a target="_blank" href="https://chainz.cryptoid.info/bcc/tx.dws?'+result[i].txid+'.htm" >'+result[i].txid+'</a>';
			if (result[i].type == 'XVG')
				url_exchain = '<a target="_blank" href="https://verge-blockchain.info/tx/'+result[i].txid+'"">'+result[i].txid+'</a>';
			if (result[i].type == 'BTG')
				url_exchain = '<a target="_blank" href="https://btgexplorer.com/tx/'+result[i].txid+'"">'+result[i].txid+'</a>';
			if (result[i].type == 'XZC'){
				url_exchain = '<a target="_blank" href="http://explorer.zcoin.io/tx/'+result[i].txid+'">'+result[i].txid+'</a>';
			}
			if (result[i].type == 'ETH'){
				
				url_exchain = '<a target="_blank" href="https://etherscan.io/tx/0x'+result[i].txid+'">'+result[i].txid+'</a>';
			}

			new_data_user.push({
				'date': moment(result[i].date).format('MM/DD/YYYY LT'),
				'amount': (parseFloat(result[i].amount)/100000000).toFixed(8),
				'type': result[i].type,
				'status' : 'Finish',
				'txid' : url_exchain

			});
		}

		return res.status(200).send({result: new_data_user});
	});
}

var get_balance =function(name,user_id,callback){
	var balance = 0;
	User.findOne({'_id' : user_id},(err,data)=>{
		(!err && data)? (
			name === 'BTC' && callback(data.balance.bitcoin_wallet.available),
			name === 'BCH' && callback(data.balance.bitcoincash_wallet.available),
			name === 'BCC' && callback(data.balance.bitconnect_wallet.available),
			name === 'LTC' && callback(data.balance.litecoin_wallet.available),
			name === 'LEC' && callback(data.balance.coin_wallet.available),
			name === 'DASH' && callback(data.balance.dashcoin_wallet.available),
			name === 'XVG' && callback(data.balance.verge_wallet.available),
			name === 'BTG' && callback(data.balance.bitcoingold_wallet.available),
			name === 'XZC' && callback(data.balance.zcoin_wallet.available),
			name === 'ETH' && callback(data.balance.ethereum_wallet.available)
		) : callback (balance) 
	})
}

function get_coin_details(name,callback){
	var data = {};
	if (name === 'BTC') { data.confirmations = 3,  data.free = 100000, data.client = BTCClient };
	if (name === 'BCH') { data.confirmations = 3,  data.free = 100000, data.client =  BCHclient };
	if (name === 'BCC') { data.confirmations = 3,  data.free = 100000, data.client =  BCCclient };
	if (name === 'LTC') { data.confirmations = 3,  data.free = 1000000, data.client =  LTCclient };
	if (name === 'LEC') { data.confirmations = 3,  data.free = 100000, data.client =  COINClient };
	if (name === 'XVG') { data.confirmations = 3,  data.free = 20000000, data.client =  XVGclient };
	if (name === 'DASH') { data.confirmations = 3,  data.free = 200000, data.client =  DASHclient };
	if (name === 'BTG') { data.confirmations = 3,  data.free = 100000, data.client =  BTGclient };
	if (name === 'XZC') { data.confirmations = 3,  data.free = 2000000, data.client =  XZCclient };
	if (name === 'ETH') { data.confirmations = 6,  data.free = 200000, data.client =  XZCclient };
	callback(data);
}

function check_wallet(Client,wallet,callback){
	Client.validateAddress(wallet, function (err, valid) {
		err || !valid.isvalid ? callback(false) : callback(true)
	})
}

function SubmitWithdraw(req,res){
	var address = req.body.address;
	var amount = parseFloat(req.body.amount)*100000000;
	var user = req.user;
	var type = req.body.type;
	if (req.body.token_crt == req.session.token_crt)
	{

		if (amount < 2000000) 
			return res.status(404).send({message: 'Minimum withdrawal $200 !'});
		if ( !address)
			return res.status(404).send({message: 'Please enter address wallet '+type+'!'});
		if ( !amount || isNaN(amount) || amount < 0.01)
			return res.status(404).send({message: 'Please enter amount > '+type+'!'});

		if (req.user.security.two_factor_auth.status == 1)
		{
			var verified = speakeasy.totp.verify({
		        secret: user.security.two_factor_auth.code,
		        encoding: 'base32',
		        token: req.body.authenticator
		    });
		    if (!verified) {
		    	return res.status(404).send({ message: 'The two-factor authentication code you specified is incorrect.'});
		    }
		}
		
		get_coin_details(type,function(coin_details){
			get_balance(type,user._id,function(ast_balance){

				console.log(parseFloat(ast_balance),parseFloat(amount),parseFloat(coin_details.free));
				if (parseFloat(ast_balance) < parseFloat(amount)+parseFloat(coin_details.free)) 
				{
					return res.status(404).send({error: 'amount', message: 'Ensure wallet has sufficient balance!'});
				}
				else
				{
					var string_sendrabit;
					if (type == 'ETH')
					{
						check_wallet_eth(address,function(cb){
							cb ? (
								string_sendrabit = user._id.toString()+'_'+amount.toString()+'_'+address.toString(),
								sendRabimq.publish('','Withdraw_'+type+'',new Buffer(string_sendrabit)),
								//sendmail_withdraw(user,type,amount/100000000,address,function(blcb){
									res.status(200).send({error: '', status: 1, message: 'Withdraw success'})
								//})
							) : (
								res.status(404).send({message:'Error Validate Address!'})
							)
						})
					}
					else
					{
						check_wallet(coin_details.client,address,function(cb){
							cb ? (
								string_sendrabit = user._id.toString()+'_'+amount.toString()+'_'+address.toString(),
								sendRabimq.publish('','Withdraw_'+type+'_LEN',new Buffer(string_sendrabit)),
								//sendmail_withdraw(user,type,amount/100000000,address,function(blcb){
									res.status(200).send({error: '', status: 1, message: 'Withdraw success'})
								//})
							) : (
								res.status(404).send({message:'Error Validate Address!'})
							)
						})
					}
				}
			})
		})
	}
}

function check_wallet_eth(wallet,callback){
	util.isValidAddress(wallet) ? callback(true) : callback(false);
}



var update_wallet = function(name ,wallet,user_id,callback){

	var obj = null;
	if (name === 'BTC') obj =  { 'balance.bitcoin_wallet.cryptoaddress': wallet }
	if (name === 'BCH') obj =  {'balance.bitcoincash_wallet.cryptoaddress' : wallet};
	if (name === 'BCC') obj = {'balance.bitconnect_wallet.cryptoaddress' : wallet};
	if (name === 'LTC') obj = {'balance.litecoin_wallet.cryptoaddress': wallet};
	if (name === 'LEC') obj = {'balance.coin_wallet.cryptoaddress': wallet};
	if (name === 'DASH') obj = {'balance.dashcoin_wallet.cryptoaddress': wallet};
	if (name === 'XVG') obj = {'balance.verge_wallet.cryptoaddress': wallet};
	if (name === 'BTG') obj = {'balance.bitcoingold_wallet.cryptoaddress': wallet};
	if (name === 'XZC') obj = {'balance.zcoin_wallet.cryptoaddress': wallet};
	User.update({ _id :user_id }, { $set : obj }, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
function get_new_address(Client,name,user,callback){
	var wallet = '';
	if (name === 'BTC') wallet = user.balance.bitcoin_wallet.cryptoaddress;
	if (name === 'BCH') wallet = user.balance.bitcoincash_wallet.cryptoaddress;
	if (name === 'BCC') wallet = user.balance.bitconnect_wallet.cryptoaddress;
	if (name === 'LTC') wallet = user.balance.litecoin_wallet.cryptoaddress;
	if (name === 'LEC') wallet = user.balance.coin_wallet.cryptoaddress;
	if (name === 'DASH') wallet = user.balance.dashcoin_wallet.cryptoaddress;
	if (name === 'XVG') wallet = user.balance.verge_wallet.cryptoaddress;
	if (name === 'BTG') wallet = user.balance.bitcoingold_wallet.cryptoaddress;
	if (name === 'XZC') wallet = user.balance.zcoin_wallet.cryptoaddress;
	wallet === "" ? (
		Client.getNewAddress('', function (err, address){
			err || !address ? (
				callback(null)
			) : (
				update_wallet(name,address,user._id,function(cb){
					cb ? callback(address) : callback(null)
				})
			)

		})
	):(
		callback(wallet)
	)
}


function GetWallet (req,res){
	req.body.type ? (
		get_coin_details(req.body.type,function(data){
			get_new_address(data.client,req.body.type,req.user,function(callback){
				callback === null ? (
					res.status(404).send({message:`Can't create new address. Please try again`})
				) : (
					res.status(200).send({ wallet: callback, message: 'Success!' })
				)
			})	
		})
	) : res.status(404).send({message:`Can't create new address. Please try again`})
}

function GetWalletS (req,res){
	req.body.type ? (
		req.body.type === 'ETH' ? (
			req.user.balance.ethereum_wallet.cryptoaddress == "" ? (
				new_address(function(callback){
					callback === null ? res.status(404).send({message:`Can't create new address. Please try again`}) : (
						update_wallet_eth(req.user._id,'0x'+callback.address,callback.public,callback.private,function(cbud){
							cbud ? res.status(200).send({ wallet: '0x'+callback.address, message: 'Success!' }) :res.status(404).send({message:`Can't create new address. Please try again`})
						})
					)
				})
			) : res.status(200).send({ wallet: req.user.balance.ethereum_wallet.cryptoaddress, message: 'Success!' })		
		) : res.status(404).send({message:`Can't create new address. Please try again`})
	) : res.status(404).send({message:`Can't create new address. Please try again`})
}



function update_wallet_eth(user_id,wallet,public_key,private_key,callback){
	var obj = { $set : {
		'balance.ethereum_wallet.cryptoaddress': wallet,
		'balance.ethereum_wallet.private_key': private_key,
		'balance.ethereum_wallet.public_key': public_key
	}}
	
	User.update({ _id :user_id }, obj, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
 
function new_address(callback){
	var eth_private,eth_public, eth_address = '';
	bcapi.genAddr('', function(err, data){
		if (err !== null) {
		    callback(null);
		  } 
		  else 
		  {
		  	eth_private = data.private;
		  	eth_public = data.public;
		  	eth_address = data.address;
		    var webhook = {
				event: "unconfirmed-tx",
				address: eth_address,
				url: "http://45.35.62.49:5969/callbackETH"
			};
			bcapi.createHook(webhook, function(err, dataHook){
				console.log(dataHook);
				if (err !== null) {
					callback(null);
				} else {
					callback(data);
				}
			})
		}
	});
}

function create_token(req,res){
	var token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_');
	req.session.token_crt = token_withdraw;	
	return res.status(200).send({'token': token_withdraw});				
}

function Remove_Withdraw (req,res){
	var user = req.user;
	var string_sendrabit = req.body.id;
	sendRabimq.publish('','Remove_Withdraw_LEN',new Buffer(string_sendrabit));
	return res.status(200).send({ message: 'Success' });
}

function callbackETH(req, res){
	console.log(req.body);
	var dataCb = req.body;
	var eth_outputs = dataCb.outputs;
	var amountETH= eth_outputs[0].value;
	var valueE = web3.fromWei(amountETH, 'ether');
	console.log(valueE);
	var tx = dataCb.hash;
	console.log(tx);
	var arrAddress = eth_outputs[0].addresses;
	if (arrAddress.length > 0) {
		_.forEach(arrAddress, function(value) {
			console.log(value);
		});
	}
	res.status(200).send({'status': 'success'})
}

function SubmitWithdrawS(req, res){
	res.status(200).send({'status': 'success'})
}

module.exports = {
	Balance,
	SubmitWithdraw,
	GetWallet,
	getWithdraw_user_pendding,
	getDeposit_user_pendding,
	getWithdraw_user_finish,
	getDeposit_user_finish,
	Remove_Withdraw,
	create_token,
	GetWalletS,
	SubmitWithdrawS
}