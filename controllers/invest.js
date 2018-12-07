'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const Invest = require('../models/invest');
const service = require('../services');
const moment = require('moment');
const nodemailer = require('nodemailer');
const Ticker = require('../models/ticker');
var dateFormat = require('dateformat');
const Profit = require('../models/profit');
const Volume = require('../models/exchange/volume').module();
var _ = require('lodash');
function IndexOn(req,res){
	res.render('account/invest', {
		title: 'Investment',
		menu: 'invest'
	});
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

function DepositS(req,res){

	Profit.findOne({},function(err,results){
		var array_profit = [];
		if (results.history)
		{
			var start_for = (results.history).length >= 6 ? (results.history).length - 6 : 0;
			for (var i = (results.history).length -1; i >= start_for ; i--) {
			
				array_profit.push({
					'date' : results.history[i].date,
					'percent' : results.history[i].percent
				})
			}
		}
		

		res.locals.title = 'Deposit'
		res.locals.menu = 'deposits'
		res.locals.user = req.user,
		res.locals.array_profit = array_profit,
		res.render('account/deposits');

	})

	
}
// function Invest(req,res){
// 	res.status(200).send({message: req.body.amount});
// }

var p_node=[];
var i = 0;
var percent;
var amountInvest;

function InvestSubmit(req,res){
	//return res.status(404).send({error: 'amount', message: 'Comingsoon'})
	var amountUsd = parseFloat(req.body.amount);
	var user = req.user;
	var balance = parseFloat(user.balance.coin_wallet.available);
	
	if ( amountUsd < 100 || amountUsd % 10 != 0 || isNaN(amountUsd))
		return res.status(404).send({error: 'amount', message: 'Please enter amount > 100$ and divide by 10!'})

	GetPrice(function(price_ico){
		if(!price_ico){
			res.status(500).send({message: `Error`})
		}else{
			var ast_usd = parseFloat(price_ico.coin_usd);

			var amount = parseFloat(amountUsd)/ parseFloat(ast_usd);

			
			amount = parseFloat(amount).toFixed(8);
			amount = parseFloat(amount);
			if (parseFloat(amount)*100000000 > parseFloat(balance)){
				return res.status(404).send({error: 'amount', message: 'Ensure wallet has sufficient balance!'})
			}else{
				let newInvest = new Invest();
				newInvest.amount= amountUsd;
				newInvest.amount_coin= amount;
				newInvest.interest= 0;
				newInvest.user_id= user._id;
				newInvest.username= req.user.displayName;
				newInvest.status= 1;
				var today = new Date();
				var todays = moment();
				newInvest.date = moment(todays).format();
				if (parseFloat(amountUsd) >= 100 && parseFloat(amountUsd) < 1010) {
					newInvest.date_finish = today.getTime() + 3600000*24*240;
					newInvest.days= 289;
				}else if (parseFloat(amountUsd) >= 1010 && parseFloat(amountUsd) < 5010){
					newInvest.days= 229;
					newInvest.date_finish = today.getTime() + 3600000*24*210
				}else if (parseFloat(amountUsd) >= 5010 && parseFloat(amountUsd) < 10010){
					newInvest.days= 177;
					newInvest.date_finish = today.getTime() + 3600000*24*180

				}else if (parseFloat(amountUsd) >= 10010 && parseFloat(amountUsd) < 50010){
					newInvest.days= 120;
					newInvest.date_finish = today.getTime() + 3600000*24*120
				}else if (parseFloat(amountUsd) >= 50010){
					newInvest.days= 120;
					newInvest.date_finish = today.getTime() + 3600000*24*100
				}
				else{
					return res.status(404).send({error: 'amount', message: 'Please enter amount > 100$ and divide by 10!'})
				}


				newInvest.save((err, investStored)=>{
					if(err){
						res.status(500).send({message: `Error invest: ${err}`})	
					}else{
						var newHistory = new User()

						var query = {_id:user._id};
						var active_invest = parseFloat(user.active_invest);
						var total_invest = parseFloat(user.total_invest);
							total_invest = parseFloat(total_invest + amountUsd).toFixed(8);
							
						var new_balance = (parseFloat(balance) - parseFloat(amount)*100000000).toFixed(8);
						var data_update = {
							$set : {
								'balance.coin_wallet.available': parseFloat(new_balance),
								'active_invest': active_invest + amountUsd,
								'total_invest': parseFloat(total_invest),
								'level': 2
							},
							$push: {
								'balance.coin_wallet.history': {
									date: Date.now(), 
									type: 'sent', 
									amount: amount, 
									detail: 'Paid for lent $' +amountUsd + ' ('+amount+' LEC). Exchange rate: 1 LEC = '+parseFloat(ast_usd)+' USD'
								}
							}
						};
						// Caculate Commission Parrent
						LoopNode(amountUsd, 0, user._id, user.displayName, function (err) {
						  p_node.reverse().join(' / ');
						  console.log(p_node);
						  	User.update(query, data_update, function(err, Users){
								if(err) res.status(500).send({message: `Error al crear el usuario: ${err}`})
								return res.status(200).send({message: 'Invest success', balance: new_balance}) /*service son como helpers*/
							});
						});
					}	
					
				})
			}

			
		}

	});

	
	
}


function LoopNode(amountInvest, i, id, username, callback) {
    User.findOne({_id:id}, function (err, item) {
      if (err) return callback(err);
      if (item.p_node != '0' && i < 8) {
      	if (i == 0)
      		percent = 8;
      	if (i == 1)
      		percent = 4;
      	if (i == 2)
      		percent = 2;
      	if (i == 3)
      		percent = 1;
      	if (i == 4)
      		percent = 0.5;
      	if (i == 5)
      		percent = 0.25;
      	if (i == 6)
      		percent = 0.125;
      	if (i == 7)
      		percent = 0.0625;
  		caculateCommission(i, amountInvest, percent, item.p_node, username, function (data) {
			  console.log(data);
		});
  		p_node.push(item.p_node);
      	
      	i = i+1;
        LoopNode(amountInvest, i, item.p_node, username, callback);
      }else {
          callback();
      }

    });
}

function caculateCommission(i, amountInvest, percent, id, username, callback) {
    User.findOne({_id:id}, function (err, user) {
		if (err){
			return callback(err);
		}else{
			var commission = parseFloat(amountInvest)*(parseFloat(percent)/100);
	
			var lending_wallet = parseFloat(user.balance.lending_wallet.available) + parseFloat(commission);
				lending_wallet = parseFloat(lending_wallet).toFixed(2);
			var total_earn = parseFloat(user.total_earn) + parseFloat(commission);
				total_earn = parseFloat(total_earn).toFixed(2);
			var data_update = {
				$set : {
					'balance.lending_wallet.available': parseFloat(lending_wallet),
					'total_earn': parseFloat(total_earn)
				},
				$push: {
					'balance.lending_wallet.history': {
						date: Date.now(), 
						type: 'received', 
						amount: commission, 
						detail: 'Get '+percent+'% referral bonus from member '+username+' (F'+(i+1)+') lent $' +amountInvest
					}
				}
			};
			User.update({_id:id, level: 2}, data_update, function(err, Users){
				return callback(commission);
			});
		} 
		

		
    });
}

function test(req, res){
	const transporter = nodemailer.createTransport({
	    host: 'smtp.gmail.com',
	    port: 465,
	    auth: {
	        user: 'caligrop.info@gmail.com',
	        pass: 'bxxidjauywzcxhtp'
	    }
	});
	 let mailOptions = {
        from: '<santacoin@santa.com>', // sender address
        to: 'appnanas0001@gmail.com', // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world?', // plain text body
        html: '<b>Hello world?</b>' // html body
    };


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
       
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      
    });

	
}

function LoadDeposit(req, res){

	

	Invest.find({user_id: req.session.userId},(err,data_invest)=>{
		if(err) return res.status(500).send({message:`Error load your deposit`})
		if(!data_invest) return res.status(404).send({message:`Error load your deposit`})
		var new_data_invest = [];
		if (data_invest == undefined || _.size(data_invest) === 0)
			return res.status(404).send({message: 'No data'});

		_.forEach(data_invest, function(value) {
			new_data_invest.push({
				'date': moment(value.date).format('MM/DD/YYYY LT'),
				'expire': moment(value.date_finish).format('MM/DD/YYYY '),
				'amount': value.amount +' USD',
				'interest': value.interest+' USD',
			});
		});
		return res.status(200).send({invest: new_data_invest});

	})
}
module.exports = {
	IndexOn,
	DepositS,
	InvestSubmit,
	LoadDeposit,
	test
}