'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const TxDeposit = require('../models/txdeposit');
const service = require('../services');
const moment = require('moment');
const bitcoin = require('bitcoin');
const config = require('../config');

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

function Index(req,res){
	var user = req.user
	var wallet_coin = user.balance.coin_wallet.cryptoaddress
	var wallet_bitcoin = user.balance.bitcoin_wallet.cryptoaddress
	var email_user = user.email+'_lending';
	var wallet = req.body.wallet;

	if (wallet == 'LEC')
	{
		if (wallet_coin == "") {
			COINClient.getNewAddress('', function (err, address) {
				if (err)  return res.status(404).send({message:`Can't create new address. Please try again`})
				var data_update = {
					$set : {
						'balance.coin_wallet.cryptoaddress': address
					}
				};
				User.update({_id:user._id}, data_update, function(err, Users){
					if (err)  return res.status(404).send({message:`Can't create new address. Please try again`})
					return res.status(200).send({
						wallet: address,
						message: 'Success!'
					});
				});
				
			});
		}else{
			return res.status(200).send({wallet: wallet_coin,message: 'Success!'});
		}
	}
	else
	{
		if (wallet_bitcoin == "") {
			BTCClient.getNewAddress('', function (err, address) {
				if (err)  return res.status(404).send({message:`Can't create new address. Please try again`})
				var data_update = {
					$set : {
						'balance.bitcoin_wallet.cryptoaddress': address
					}
				};
				User.update({_id:user._id}, data_update, function(err, Users){
					if (err)  return res.status(404).send({message:`Can't create new address. Please try again`})
					return res.status(200).send({
						wallet: address,
						message: 'Success!'
					});
				});
				
			});
		}else{
			return res.status(200).send({wallet: wallet_bitcoin,message: 'Success!'});
		}
	}

	
	
	
}

function Notify(req,res){
	
	var tx = req.params.txid;

	STCclient.getTransaction(tx, function (err, transaction) {
		if(err) return res.status(500).send({message:`Error load transaction`})
		
		// if (transaction && transaction.confirmations >= 1) {
		if (transaction) {		
				var details = transaction.details;		
				details = details.filter(function (self) {
				  return self.category == 'receive'
				});
				if (parseInt(details.length) >= 1){

					for (var i = details.length - 1; i >= 0; i--) {
						var address = details[i].address;
						var amount = details[i].amount;
						console.log(address + '--' + amount);
						updateBalance(address, amount, tx, function(data){
							console.log(data);
						})
					}
					res.status(200).send();
				}else{
					res.status(200).send('No transaction address')
				}
			}else{
				console.log('no---------------------o');
				res.status(200).send();
			}
	});
	// return res.status(200).send('121');
}


function updateBalance(address, amount, tx, callback){
	User.findOne({'balance.coin_wallet.cryptoaddress': address, 'txid_last' :{$ne: tx}},(err,data)=>{
		if(err){
			callback('false');
		}else{
			if (data) {							
				TxDeposit.findOne({'txid': tx},(err,data_tx)=>{
					if (err) {
						callback('false');
					}else{
						if (data_tx) {
							callback('false');
						}else{
							var available = data.balance.coin_wallet.available;
							// return false;
							var new_available = parseFloat(amount)+ parseFloat(available);
								new_available = parseFloat(new_available).toFixed(8);
								new_available = parseFloat(new_available);
							var query = {_id: data._id};
							var data_update = {
								$set : {
									'txid_last': tx,
									'balance.coin_wallet.available': new_available
								},
								$push: {
									'balance.coin_wallet.history': {
										'date': Date.now(), 
										'type': 'received', 
										'amount': amount, 
										'detail': 'Deposit  '+amount+' LEC - <a class="text-success" href="https://explorer.lencoin.co/tx/'+tx+'" target="_blank"> Detail <i class="fa fa-link"></i></a>' 
									}
								}
								
							};

							var newTx = new TxDeposit();
							var todays = moment();
							newTx.date = moment(todays).format();
							newTx.txid = tx;
							newTx.type = 'LEC';
							newTx.username = data.displayName;
							newTx.amount = parseFloat(amount);
							newTx.save((err, dataTx)=>{
								if(err){
									callback('false');
								}else{
									User.update(query, data_update, function(err, IcoUpdate){
										if (err)
											callback('false');
										if (!IcoUpdate) {
											callback('false');
										}else{
											callback('success');
										}
										
									});
								}	
								
							})
						}
					}

				});

				
			}else{
				callback('false');
			}
		}	

	});
}


function Indexrefferal(req,res){
	res.render('account/affiliate_refferal', {
		title: 'YOUR AFFILIATES',
		menu: 'affiliate',
		user: req.user
	});
}
function Indexpromo(req,res){
	res.render('account/affiliate_promo_materials', {
		title: 'PROMO MATERIALS',
		menu: 'affiliate',
		user: req.user
	});
}
function getRefferal(req,res){
	User.find({p_node: req.session.userId}, { displayName: 1, email: 1, signupDate: 1, _id: 0 },(err,data_user)=>{
		if(err) return res.status(500).send({message:`Error load your refferal`})
		if(!data_user) return res.status(404).send({message:`Error load your refferal`})

		var new_data_user = [];
		
		if (data_user == undefined)
			return res.status(200).send({refferal: data_user});
		
		for (var i = data_user.length - 1; i >= 0; i--) {
			new_data_user.push({
				'signupDate': moment(data_user[i].signupDate).format('MM/DD/YYYY LT'),
				'email': data_user[i].email,
				'displayName': data_user[i].displayName,
			});
		}

		return res.status(200).send({refferal: new_data_user});

		res.status(200).send({refferal : data_user});
	})
}
module.exports = {
	Index,
	Notify
}