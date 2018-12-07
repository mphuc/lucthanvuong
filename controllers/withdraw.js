'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const Withdraw = require('../models/withdraw');
const Deposit = require('../models/deposit');
const service = require('../services');
const moment = require('moment');
const Ticker = require('../models/ticker');
const _ = require('lodash');
const bcrypt = require('bcrypt-nodejs');
const nodemailer = require('nodemailer');
const bitcoin = require('bitcoin');
const config = require('../config');
var sendpulse = require("sendpulse-api");
var sendpulse = require("../models/sendpulse.js");

var API_USER_ID= "dca1a45bc032fbcb8713853a6b4bc30f"
var API_SECRET= "73e23238199ca94b49b24034a6744727"
var TOKEN_STORAGE="/tmp/"

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

function Index(req,res){
	res.locals.title = 'Withdraw'
	res.locals.menu = 'withdrawal'
	res.locals.user = req.user
	res.render('account/withdraw');
}

function WithdrawSubmit(req, res){

	var address_coin = req.body.to_coin_address;
	var amount_coin = req.body.amount_coin;
	var password = req.body.password;

	
	var user = req.user;

	if (!address_coin) 
		return res.status(404).send({message: 'Please enter your LEC address'});
	if (!amount_coin || isNaN(amount_coin) || parseFloat(amount_coin) < 5) 
		return res.status(404).send({message: 'Please enter a minimum of 5 LEC'});
	if (!password) 
		return res.status(404).send({message: 'Please enter your login password'});

	!user.validPassword(_.trim(req.body.password))
	if (!user.validPassword(_.trim(req.body.password)) )
		return res.status(404).send({error: 'password', message: 'Wrong Password!'});
	
	//return res.status(404).send({message: 'Comming soon'});

	let newWithdraw = new Withdraw();
	
	COINClient.validateAddress(address_coin, function (err, valid) {
		var ast_balance;
		var new_ast_balance;
		var token_withdraw;
		var today;
		var query;
		var data_update;
		err || !valid.isvalid ? (
			res.status(404).send({message: 'Please enter a valid address!'})	
		): (
			ast_balance = parseFloat(user.balance.coin_wallet.available),

			parseFloat(ast_balance) < parseFloat(amount_coin)*100000000 ? (
				res.status(404).send({message: 'Ensure wallet has sufficient balance!'})
			) :
			(
				new_ast_balance = parseFloat(ast_balance - amount_coin).toFixed(8),
				token_withdraw = _.replace(bcrypt.hashSync(new Date(), bcrypt.genSaltSync(8), null),'?','_'),
				today = moment(),
				newWithdraw.active_email = 0,
				newWithdraw.amount = parseFloat(amount_coin)*100000000,
				newWithdraw.user_id = user._id,
				newWithdraw.status = 'pending',
				newWithdraw.username = user.displayName,
				newWithdraw.wallet = address_coin,
				newWithdraw.txid = '',
				newWithdraw.fee = '0',
				newWithdraw.date = moment(today).format(),
				newWithdraw.type = 'LEC',
				newWithdraw.token_withdraw = token_withdraw,
				newWithdraw.sendmail = 0,
				newWithdraw.save((err, WithdrawStored)=>{
					!err ? (
						mailConfirmWithdraw(token_withdraw, amount_coin, address_coin, user,  function(data){
							return res.status(200).send({error: '', status: 1, message: 'Withdraw success'});
						})
					) : (res.status(500).send({message: `Error Withdraw`}) )
				})
			)
		)
	});
}


function mailConfirmWithdraw(token_withdraw, amount_ast, address_stc, user, callback){
    let link_token_ = "https://lencoin.co/de495b769293abf4edf3e08a021abtc?token="+token_withdraw + "_" + user._id+"";
   	
    var content = '<!DOCTYPE html> <html> <head> <title></title> </head> <body style="background: #c1bdba;"> <div class="content" style="background: linear-gradient(135deg, rgba(26, 89, 108, 0.52), rgba(34, 125, 140, 0.93), rgba(45, 205, 253, 0.39)); padding: 40px; max-width: 600px; margin: 40px auto; border-radius: 4px; box-shadow: 0 4px 10px 4px rgba(19, 35, 47, 0.3); "> <div style="text-align: center;"> <img style="margin: 0 auto; width: 150px" src="https://lencoin.co/images/logo.png"> </div> <div style="text-align: left; margin-top: 40px; color: #fff">';
    content += '<p style="color:#fff">Dear <b style="color:#fff">'+user.displayName+'</b>,';
    content += '<p style="color:#fff">A request to withdraw '+amount_ast+' LEC from your lencoin account to address '+address_stc+' was just made.</p>';
    content += '<p style="color:#fff">To confirm the withdrawal, please click the following link: </p>';
    content += '<p style="text-align: center;margin-top:15px;"><a href="'+link_token_+'" style="border: 2px solid #fff; border-radius: 30px; display: inline-block; padding: 10px 30px; word-spacing: 3px; font-size: 15px; color: #fff; text-decoration: none;" href="">Click to Confirm withdraw</a></p>';
    content += '</div> </div> </body> </html>';
    var email = {
        "html" : content,
        "text" : "lencoin",
        "subject" : "Withdrawal Confirmation",
        "from" : {
            "name" : "lencoin.co",
            "email" : 'no-reply@lencoin.co'
        },
        "to" : [
            {
                "name" : "lencoin.co",
                "email" : user.email
            }
        ]
    };
   	
    nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
            host: 'mail.smtp2go.com',
            port: 2525,
            secure: false,
            auth: {
                user: 'no-reply@lencoin.co',
                pass: 'Admin123@@'
            }
        });
        let mailOptions = {
            from: 'no-reply@lencoin.co', 
            to: user.email, 
            subject: 'Withdrawal Confirmation', 
            text: 'Withdrawal Confirmation', 
            html: content
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });

    /*var answerGetter = function answerGetter(data){
        console.log(data);
    }
    sendpulse.smtpSendMail(answerGetter,email);*/
    callback(true);
}
function active(req, res) {
	let token = null;
	_.has(req.query, 'token') ? (
		token = _.split(req.query.token, '_'),
		// console.log(token),
		token.length > 1 && (
			Withdraw.findOneAndUpdate({
				'user_id' : token[1],
				'token_withdraw' : token[0],
				'active_email' : 0
			}, {
				'active_email' : 1
			}, function(err, result){
				res.redirect('/login')
			})
		)
	) : (
		res.redirect('/login')
	)
}
function actives(req, res) {
	let token = null,
		wallet = null,
		amount_btc_send = null,
		amount_stc_send = null,
		withdraw_id = null,
		type = null;

	_.has(req.query, 'token') ? (
		token = _.split(req.query.token, '_'),
		
		token.length > 1 && (
			Withdraw.findOne({
				'user_id' : token[1],
				'token_withdraw' : token[0],
				'active_email' : '0',
				'txid': '',
				'status':'pending'
			}, function(err, result){
				if (result) {
					User.findOne({ '_id': result.user_id },function(err, user) {
						if (err || !user)
						{
							res.redirect('/login')
						}
						else
						{	
							var amount_coin_send = parseFloat(result.amount);
							var ast_balance = parseFloat(user.balance.coin_wallet.available);
							var wallet = result.wallet;
							var withdraw_id = result._id;
							if (parseFloat(ast_balance) >= parseFloat(amount_coin_send))
							{
								var new_ast_balance = (parseFloat(ast_balance) - parseFloat(amount_coin_send)).toFixed(8);
								var query = {_id:result.user_id};
								var data_update = {
									$set : {
										'balance.coin_wallet.available': parseFloat(new_ast_balance)
									},
									$push: {
										'balance.coin_wallet.history': {
											date: Date.now(), 
											type: 'sent', 
											amount: amount_coin_send/100000000, 
											detail: 'Withdraw ' +parseFloat(amount_coin_send)/100000000 + ' LEC  from LEC wallet '+result.wallet+''
										}
									}
								};
								User.update(query, data_update, function(err, UsersUpdate){
									if(err) res.redirect('/login');
									Withdraw.update({_id: withdraw_id}, { $set : { 'active_email': '1' }}, function(err, WithdrawUpdate){
										amount_coin_send = parseFloat(amount_coin_send)/100000000;

										console.log("12333333");

										GMDsendfrom(wallet, amount_coin_send, withdraw_id, function(datas){
							    			res.redirect('/account/history-transaction')
							    		})				
									});
								})
							}
							else
							{
								res.redirect('/login');
							}
						
						}
					});
				}
				else
				{
					res.redirect('/login')
				}
				
				
			})
		)
	) : (
		res.redirect('/login')
	)
}

function GMDsendfrom( wallet, amount_stc_send, withdraw_id, callback){
	COINClient.sendToAddress( wallet, amount_stc_send, function (err, transaction) {		
		if (err) {
			GMDsendfrom( wallet, amount_stc_send, withdraw_id, function(data){
				console.log('success');
			});
		}else{
			var querys = {_id: withdraw_id};
			var data_updates = {
				$set : {
					'txid': transaction,
					'status': 'completed'
				}
			};
			Withdraw.update(querys, data_updates, function(err, WithdrawUpdate){
				callback('success');
			});
		}
	});
}

function LoadDataWithdraw(req, res){
	Withdraw.find({user_id: req.session.userId},(err,data)=>{
		
		if(err) return res.status(500).send({message:`Error load your withdraw`})
		let data_withdraw = data;
	

		var new_data_withdraw = [];
		if (data_withdraw == undefined || _.size(data_withdraw) === 0)
			return res.status(404).send({message: 'No data'});

		_.forEach(data_withdraw, function(value) {
			new_data_withdraw.push({
				'date': moment(value.date).format('MM/DD/YYYY LT'),
				'amount': parseFloat(value.amount)/100000000,
				'type': value.type, 
				'status': (value.status == 'pending' ? 'Pending' : 'Completed'),
				'wallet': value.wallet,
				'txid': value.txid
				
			});
		});
		return res.status(200).send({withdraw: new_data_withdraw});

	})
}

function LoadDataDeposit(req, res){
	Deposit.find({user_id: req.session.userId},(err,data)=>{
		
		if(err) return res.status(500).send({message:`Error load your withdraw`})
		let data_withdraw = data;
	

		var new_data_withdraw = [];
		if (data_withdraw == undefined || _.size(data_withdraw) === 0)
			return res.status(404).send({message: 'No data'});

		_.forEach(data_withdraw, function(value) {

			var status = (value.status == 1) ? 'Finish' : value.confirm+'/3 Confirmation';

			new_data_withdraw.push({
				'date': moment(value.date).format('MM/DD/YYYY LT'),
				'amount': parseFloat(value.amount)/100000000,
				'type': value.type, 
				'status': status,
				'txid': value.txid
				
			});
		});
		return res.status(200).send({deposit: new_data_withdraw});

	})
}

module.exports = {
	Index,
	WithdrawSubmit,
	active,
	actives,
	LoadDataWithdraw,
	LoadDataDeposit
}