'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const Withdraw = require('../models/withdraw');
const service = require('../services');
const moment = require('moment');
const Ico = require('../models/ico');
const _ = require('lodash');
const IcoSum = require('../models/icosum');
const Ticker = require('../models/ticker');
const TxDeposit = require('../models/txdeposit');
const bitcoin = require('bitcoin');
var cron = require('node-cron');
const config = require('../config');
const request = require('request');
const Deposit = require('../models/deposit');
const Order = require('../models/order');


const sendRabimq = require('../rabbit_comfim');
//cron.schedule('30 */10 * * * *', function(){
 // updatePriceUsd();
//});

/*cron.schedule('59 59 10 * * *', function(){
	IcoSum.update({},{$set : {'status' : 1}},(err,result_order)=>{
	}); 
	console.log('start ICO');
});*/


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

function get_date_ico(callback){
	var date = new Date();
	date = date.setDate(date.getDate() );
	date = new Date(date);
	var day = date.getDate() + 2;
	var month = date.getMonth();
	var year = date.getFullYear();

	var d = new Date(year, month, day, '11', '00', '00', '00');
	callback(d);
}

function GettemplateICO(req,res){
	Order.find({'user_id' : req.user._id},(err,result_order)=>{
		IcoSum.findOne({},(err,total_ico)=>{
	    	get_price_ico(function(price_ico){

	    		get_date_ico(function(date_start){
	    			res.locals.title = 'ICO';
					res.locals.menu = 'ico_buy';
					res.locals.user = req.user;
					res.locals.price_ico = price_ico;
					res.locals.total_ico = total_ico;
					res.locals.order_history = result_order;
					res.locals.date_start = date_start;
					res.render('account/ico');
	    		});
			});
		});
	});
	
}

function GettemplateDetailsICO(req,res){
	res.locals.title = 'ICO Infomation';
	res.locals.menu = 'ico';
	res.locals.user = req.user;
	res.render('account/ico_details');
}


function Get_Price_BTC_USD(callback){
	request({
        url: 'https://api.coinmarketcap.com/v1/ticker/bitcoin',
        json: true
    }, function(error, response, body) {
    	if (!body || error) {
    		return res.status(200).send('false');
    	}
		var price_usd = parseFloat(body[0].price_usd);
		callback(price_usd);
	});
}

function get_price_ico(callback){
	IcoSum.findOne({},(err,result)=>{
    	var price_ico = 0.4;
    	if (parseFloat(result.total) > 800000)
    	{
    		price_ico = 0.6;
    	}
    	if (parseFloat(result.total) > 1600000)
    	{
    		price_ico = 0.8;
    	}
    	if (parseFloat(result.total) > 2400000)
    	{
    		price_ico = 1.0;
    	}

    	if (parseFloat(result.total) > 3300000)
    	{
    		price_ico = 1.2;
    	}

    	if (parseFloat(result.total) > 4200000)
    	{
    		price_ico = 1.4;
    	}

    	if (parseFloat(result.total) > 5092997)
    	{
    		price_ico = 1.6;
    	}
    	callback(price_ico);
    })
}

function GetPriceICO(req,res){
	if (req.body.amount_coin)
	{
		var amount_coin = parseFloat(req.body.amount_coin);
		get_price_ico(function(price_ico){
			
			Get_Price_BTC_USD(function(price){
				var result = ((price_ico/price)*amount_coin).toFixed(8);
				return res.status(200).send({'result' : result});
			});
		});
	}
}

function IcoSubmit(req,res){

	IcoSum.findOne({}, (err, sum) => {
		if (!err && sum && parseInt(sum.status) == 1)
		{
			var user_login = req.user;
			var amount_ast = parseFloat(req.body.amount_coin);
			
			var wallet = req.body.address_coin;
			
			if (amount_ast === '' || amount_ast < 50 || amount_ast > 10000 || isNaN(amount_ast))
		        return res.status(401).send({  message: 'Please enter number from 50 LEC to 10,000 LEC' })

		    if (wallet === '')
		        return res.status(401).send({  message: 'Please enter your LEC address' })
		    
		    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null)
		    {
		        return res.status(401).send({ message : 'Please select captcha'});
		    }
		    const secretKey = "6LfTIDYUAAAAAIweBOTHOlRspskGWNq7bxmat9Ow";

		    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

		    request(verificationURL,function(error,response,body) {
		        body = JSON.parse(body);
		        if(body.success !== undefined && !body.success) {
		            return res.status(401).send({
		                    message : 'Please select captcha'
		                });
		        }
		        else
		        {
		    		Ticker.findOne({},(err,data_ticker)=>{
		    			err ? res.status(500).send({message: `Error invest: ${err}`}) : (
		    				Get_Price_BTC_USD(function(btc_usd){
		    					var price_usd = parseFloat(data_ticker.price_usd);
		    					var amount_btc = parseFloat((amount_ast*price_usd)/btc_usd)*100000000;
		    					var balance_btc = parseFloat(user_login.balance.bitcoin_wallet.available);



		    					if (balance_btc >= amount_btc)
		    					{
		    						Order.find({"$and" : [{'user_id' : req.user._id}, {'status' : 0} ]},(err,check_buy)=>{
										if (check_buy.length == 0)
										{
											create_order(amount_ast*100000000,amount_btc,'BTC',req.user,function(cb){
												if (!cb) return res.status(500).send({message: `Error Buy`})
												else
													return res.status(200).send({error: '', status: 1, message: 'Buy ICO success'});
											})
										}
										else
										{
											return res.status(404).send({message:'You are ordering ICO.'});
										}
									});

		    						/*var new_balance_btc = parseFloat(balance_btc) - parseFloat(amount_btc);
		    						var new_balance_coin = parseFloat(user_login.balance.coin_wallet.available) + parseFloat(amount_ast)*100000000;

		    						var query = {_id:user_login._id};
		    						var data_update = {
										$set : {
											'balance.bitcoin_wallet.available': parseFloat(new_balance_btc),
											'balance.coin_wallet.available': new_balance_coin
										},
										$push: {
											'balance.coin_wallet.history': {
												date: Date.now(), 
												type: 'ico', 
												amount: amount_ast, 
												detail: 'Buy ' +amount_ast + ' LEC. Exchange rate: 1 LEC = '+parseFloat(price_usd)+' USD'
											}
										}
									};
									User.update(query, data_update, function(err, Users){
										if(err) res.status(500).send({message: `Error al crear el usuario: ${err}`})
										IcoSum.findOne({}, (err, sum) => { 
											var total = (parseFloat(sum.total) + parseFloat(amount_ast)).toFixed(8);
									    	sum.total = parseFloat(total);
									        sum.save((err, sum) => {
									        	err ? res.status(500).send({message: `Error network`}) : res.status(200).send({message: 'success'});
									        });
										});
									});	*/
		    					}
		    					else
		    					{
		    						res.status(500).send({message: 'Your BTC balance is not enough'});
		    					}
		    				})
		    			)
		    		})   	
		        }
		    });
		}
		else
		{
			res.status(500).send({message: 'ICO not yet sold. Please come back later'});
		}
	})
}

function create_order(amount_coin,amount_send,type,user,callback){
	let newOrder = new Order();
	var today = moment();
	newOrder.amount_coin = amount_coin;
	newOrder.amount_payment = amount_send;
	newOrder.method_payment = type;
	newOrder.user_id = user._id;
	newOrder.status = 0;
	newOrder.username = user.displayName;
	newOrder.date = moment(today).format();
	newOrder.save((err, OrderStored)=>{
		if(err){
			callback(false);	
		}
		else
		{
			callback(true);
		}
	});
}

function updatePriceUsd(){
	IcoSum.findOne({}, (err, sum) => {  
	    if (err) {
	        return false;
	    } 
	    else 
	    {
	    	var data_update = {};
	    		
	    	get_price_ico(function(price_usd){
	    		console.log(price_usd);
	    		data_update = {
					$set : {
						'price_usd': price_usd
					}
				},
				Ticker.findOneAndUpdate({},data_update,(err,new_data_ticker)=>{
					return 1
				})
	    	})
	    }
	});	
}

function Balance(req, res){
	var wallet = req.body.wallet;
	BtcClient.getAccount(wallet, function (err, account) {		
		BtcClient.getBalance(account, function (err, balance) {		
			res.status(200).send({balance: balance});
		});
	});
	
}
function Notify(req,res){
	var tx = req.params.txid;
	getTransaction(BTCClient,tx,function(transaction){
		if (transaction !== null)
		{
			var details = transaction.details;
			details = details.filter(function (self) {
			  return self.category == 'receive'
			});
			if (parseInt(details.length) > 0) 
			{
				var address = details[0].address;
				var amount = details[0].amount;
				var amount_satosi = parseFloat(amount)*100000000;

				Ico.findOne({address_btc: address, status: '0', txid: ''},(err,data)=>{

					if(err || !data) return res.status(500).send({message:`Error load transaction`})
					var amount_btc = data.amount_btc;
					var amount_coin = parseFloat(data.amount_coin);
					var user_id = data.user_id;


					if (parseInt(amount_satosi) >= parseInt(amount_btc)) 
					{
						IcoSum.findOne({}, (err, sum) => {  
						    if (err)  return res.status(500).send(err);
						    else 
						    {
						    	if (transaction.confirmations > 0) {
						    		console.log('update_transation_confirm > 0');
						    		var total = (parseFloat(sum.total) + parseFloat(amount_coin)).toFixed(8);
							    	sum.total = parseFloat(total);
							        sum.save((err, sum) => {
							            if (err) return res.status(500).send(err);
							            else
							            {
							            	var querys = {address_btc: address};
											var data_updates = {
												$set : {
													'txid': tx,
													'status': 1,
													'txid_ast': transaction,
													'receive': amount_satosi
												}
												
											};
											Ico.update(querys, data_updates, function(err, IcoUpdate){
												!err && (
													update_balace_coin(parseFloat(amount_coin),user_id,function(cb){
														return res.status(200).send('complete')
														/*commision_referral(data.user_id,parseFloat(amount_coin),function(cb2){
															
														});*/
													})
												)
											});		  	
							            }
							        });
						    	}
						    	else
						    	{
						    		
						    		return res.status(200).send('confirm == 0')
						    	}
						    }
						});	
					}
					else
					{
						return res.status(200).send('send none')
					}
				});
			}
			else
			{
				return res.status(200).send()
			}
		}
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

var	commision_referral = function(user_id,amount_coin,callback){
	var coin_balance;
	var new_ast_balance;
	var query;
	var data_update;
	User.findById(user_id, function(err, user_curent) {
		(!err && user_curent) || parseInt(user_curent.p_node) != 0  ? (
			
			User.findById(user_curent.p_node, function(err, user) {
				!err && user ? (
					coin_balance = parseFloat(user.balance.coin_wallet.available),
					new_ast_balance = parseFloat(coin_balance + amount_coin*0.05),
					query = {_id:user_curent.p_node},
					data_update = {
						$set : {
							'balance.coin_wallet.available': parseFloat(new_ast_balance)
						},
						$push: {
							'balance.coin_wallet.history': {
								'date': Date.now(), 
								'type': 'refferalico', 
								'amount': parseFloat(amount_coin*0.05), 
								'detail': 'Get '+amount_coin*0.05+' LEC from '+user_curent.displayName+' to buy '+amount_coin+' LEC'
							}
						}
					},
					User.update(query, data_update, function(err, UsersUpdate){
						err ? callback(false) : callback(true);
					})
				) : callback(false)
			})
		): callback(false)
	});
}



var getTransaction = function(client , tx, callback){
	client.getTransaction(tx, function (err, transaction) {
		err || !transaction ? callback(null) : callback(transaction);
	})
}


function Notifygmd(req,res){
	var tx = req.params.txid;
	sendRabimq.publish('','LEC_DEPOSIT',new Buffer(tx));
	return res.status(200).send('run AMQ GMD_DEPOSIT');
}

function Notifybtc(req,res){
	var tx = req.params.txid;
	sendRabimq.publish('','BTC_DEPOSIT',new Buffer(tx));
	return res.status(200).send('run AMQ BTC_DEPOSIT');
}

function sendfrom(addressbtc, txid, sendFrom, addressast, amountast, amount_satosi, callback){
	TxDeposit.findOne({'txid': txid},(err,data_tx)=>{
		if (err) {
			callback('success');
		}else{
			if (data_tx) {
				callback('success');
			}else{
				var newTx = new TxDeposit();
				var todays = moment();
				newTx.date = moment(todays).format();
				newTx.txid = txid;
				newTx.type = 'LEC';
				newTx.username = addressast;
				newTx.amount = parseFloat(amountast);
				AstClient.sendFrom(sendFrom, addressast, amountast, function (err, transaction) {		
					if (err) {
						sendfrom(addressbtc, txid, sendFrom, addressast, amountast, amount_satosi, function(data){
							console.log(data);
						});
					}else{
						var querys = {address_btc: addressbtc};
						var data_updates = {
							$set : {
								'txid': txid,
								'status': 1,
								'txid_ast': transaction,
								'receive': amount_satosi
							}
							
						};
						Ico.update(querys, data_updates, function(err, IcoUpdate){
							newTx.save((err, dataTx)=>{
								if(err){
									callback('success');
								}else{
									
									callback('success');
								}	
								
							})
						});
					}
				});
			}
		}
	});

	
}
function sendfromgmd(addressbtc, txid, sendFrom, addressast, amountast, amount_satosi, callback){

	TxDeposit.findOne({'txid': txid},(err,data_tx)=>{
		if (err) {
			callback('success');
		}else{
			if (data_tx) {
				callback('success');
			}else{
				var newTx = new TxDeposit();
				var todays = moment();
				newTx.date = moment(todays).format();
				newTx.txid = txid;
				newTx.type = 'STC';
				newTx.username = addressast;
				newTx.amount = parseFloat(amountast);

				AstClient.sendFrom(sendFrom, addressast, amountast, function (err, transaction) {		
					if (err) {
						sendfromgmd(addressbtc, txid, sendFrom, addressast, amountast, amount_satosi, function(data){
							callback('success');
						});
					}else{
						var querys = {address_btc: addressbtc};
						var data_updates = {
							$set : {
								
								'status': 1,
								'txid_ast': transaction,
								'receive': amount_satosi
							}
							
						};
						Ico.update(querys, data_updates, function(err, IcoUpdate){
							newTx.save((err, dataTx)=>{
								if(err){
									callback('success');
								}else{
									
									callback('success');
								}	
								
							})
							
						});
					}
				});

				
			}
		}
	});
}


function LoadHistory(req, res){
	let data = {};
	IcoSum.findOne({}, (err, sum) => {  
	    if (err) {
	        res.status(500).send(err);
	    } else {
	    	var total = parseFloat(sum.total).toFixed(8);
	    	var percent = parseFloat(total/6000000)*100;
	    	percent=percent.toFixed(2);
	    	data.percent = percent;
	    	data.total = parseFloat(total);
	    	return res.status(200).send(data);
	    }


	});	
}

module.exports = {
	IcoSubmit,
	Notify,
	Balance,
	LoadHistory,
	Notifygmd,
	GettemplateICO,
	GetPriceICO,
	GettemplateDetailsICO,
	Notifybtc
}