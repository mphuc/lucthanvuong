'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');
const Ticker = require('../models/ticker');
const bitcoin = require('bitcoin');
const Volume = require('../models/exchange/volume').module();
const STCclient = new bitcoin.Client({
	host: 'localhost',
	port: 19668,
	user: 'santacoinrpc',
	pass: 'ASd1Q2HEGJJPnL5knD6Ez3qHhefDtySXp66vUT1TfuEQ',
	timeout: 30000
});
function IndexOn(req,res){

	GetPrice(function(price_usd){
		var fullUrl = req.protocol + '://' + req.get('host');
		var user = req.user
		var email_user = user.email+'_';
		/*STCclient.getBalance(email_user, function (err, balance) {
			if (parseFloat(balance) > 1)
	        {
	        	var description = email_user;
	        	var amount_send = parseFloat(balance) - 0.5;
	        	amount_send = parseFloat(amount_send).toFixed(8);
	        	var wlSanta = 'Si3SS2Kx6ULwS31juyxdK2icGv55Zgh5ad';
	        	var wlLocal = 'SPMWCjhGsNQdGFqqZ3h6u2iZwUbBzZVGqA';
	        	STCclient.sendFrom(email_user,wlSanta,parseFloat(amount_send),1,description,'', function (err, result) {
	                if (err){
	                    console.log('err')
	                }
	                else
	                {
	                	console.log('success');
	                }
	            });
	        }
			
		});*/



		res.locals.title = 'Dashboard';
		res.locals.menu = 'dashboard';
		res.locals.user = user;
		res.locals.fullUrl = fullUrl;
		res.locals.price_usd = price_usd.coin_usd;
		res.render('account/dashboard');
	})
}

function GetPrice(callback){
	Ticker.findOne({},(err,data)=>{
		Volume.findOne({},(err,data_ticker)=>{
			callback({
				'btc_usd' : data.btc.usd,
				'coin_usd' : (parseFloat(data.btc.usd)*(parseFloat(data_ticker.last)/100000000)).toFixed(8),
				'coin_btc' : (parseFloat(data_ticker.last)/100000000).toFixed(8)
			})
		});
	})
}

function setupTicker(){
	let newTicker = new Ticker();
	newTicker.last= '0.5';
	newTicker.bid= '0.5';
	newTicker.ask= '0.5';
	newTicker.high= '0.5';
	newTicker.volume= '0.5';
	newTicker.price_usd= '0.5';
	newTicker.price_btc= '0.5';
	newTicker.save((err, investStored)=>{
		console.log(investStored);
	});
}

function TransferToCoin(req, res){

	console.log(req.body);

	var amountUsd = parseFloat(req.body.amount);
	
	var user = req.user;
	var balance_lending = parseFloat(user.balance.lending_wallet.available).toFixed(8);
	var balance_coin = parseFloat(user.balance.coin_wallet.available).toFixed(8);
	
	
	if ( amountUsd < 5 || isNaN(amountUsd))
		return res.status(404).send({message: 'Please enter amount > 5$!'})
	if (amountUsd > balance_lending )
		return res.status(404).send({message: 'The account balance not enough to convert'})
	
	GetPrice(function(price_ico){
		if(!price_ico){
			res.status(500).send({message: `Error al crear el usuario: ${err}`})
		}else{
			amountUsd = parseFloat(amountUsd).toFixed(8);
			var ast_usd = parseFloat(price_ico.coin_usd);
			var amount = parseFloat(amountUsd)/ parseFloat(ast_usd);
			amount = parseFloat(amount).toFixed(8);
			var query = {_id:user._id};
			var new_balance_lending = parseFloat(balance_lending) - parseFloat(amountUsd);
			new_balance_lending = parseFloat(new_balance_lending).toFixed(2);
			var new_balance_coin = parseFloat(balance_coin) + (parseFloat(amount)*100000000);
			new_balance_coin = parseFloat(new_balance_coin).toFixed(8);
			var data_update = {
				$set : {
					'balance.lending_wallet.available': parseFloat(new_balance_lending),
					'balance.coin_wallet.available': parseFloat(new_balance_coin)
				},
				$push: {
					'balance.lending_wallet.history': {
						date: Date.now(), 
						type: 'Transfer', 
						amount: parseFloat(amountUsd), 
						detail: 'Transfer to lencoin wallet  $' +parseFloat(amountUsd) + ' ('+ parseFloat(amount)+' LEC) <br> Exchange rate: 1 LEC = '+parseFloat(ast_usd)+' USD'
					},
					'balance.coin_wallet.history': {
						date: Date.now(), 
						type: 'received', 
						amount: parseFloat(amount), 
						detail: 'Received from Lending wallet $' +parseFloat(amountUsd) + ' ('+ parseFloat(amount)+' LEC) <br> Exchange rate: 1 LEC = '+parseFloat(ast_usd)+' USD'
					}
				}
			};

			User.update(query, data_update, function(err, Users){
				if(err) res.status(500).send({message: `Error al crear el usuario: ${err}`})
				return res.status(200).send({
					message: 'Transfer success', 
					balance_lending: parseFloat(new_balance_lending),
					balance_coin: parseFloat(new_balance_coin)
				}) /*service son como helpers*/
			});
		} 
		

	});

	
}
function ExchangeTemplate(req,res){

	
	res.locals.title = 'Exchange';
	res.locals.menu = 'exchange';
	
	res.render('account/exchange');
	
}


module.exports = {
	IndexOn,
	TransferToCoin,
	ExchangeTemplate
}