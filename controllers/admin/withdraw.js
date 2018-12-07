'use strict'

const User = require('../../models/user');
const Withdraw = require('../../models/withdraw');
const Ticker = require('../../models/ticker');
const Invest = require('../../models/invest');
const IcoSum = require('../../models/icosum');
const Ico = require('../../models/ico');
const moment = require('moment');
const speakeasy = require('speakeasy');
const _ = require('lodash');
const bitcoin = require('bitcoin');

var config = require('../../config');
const STCclient = new bitcoin.Client({
	host: config.COIN.host,
	port: config.COIN.port,
	user: config.COIN.user,
	pass: config.COIN.pass,
	timeout: config.COIN.timeout
});

const BTCclient = new bitcoin.Client({
	host: config.BTC.host,
	port: config.BTC.port,
	user: config.BTC.user,
	pass: config.BTC.pass,
	timeout: config.BTC.timeout
});


function ListWithdraw(req, res){
	Withdraw.find({status: '0'}, (err, data)=>{
		if (err) {
			res.status(500).send({'message': 'data not found'});
		}else{
			// res.status(200).send(users);
			res.render('admin/withdraw', {
				title: 'Withdraw',
				layout: 'layout_admin.hbs',
				history: data
			});
		}
	})
}

function ListWithdrawhistory(req, res){
	Withdraw.find({}, (err, data)=>{
		if (err) {
			res.status(500).send({'message': 'data not found'});
		}else{
			res.render('admin/withdraw_history', {
				title: 'Withdraw',
				layout: 'layout_admin.hbs',
				history: data
			});
		}
	})
}
function WithdrawSubmit(req, res){
	var id = req.query.id;
	if (id) {
		Withdraw.findOne({$and : [{'_id':id},{'type' : 'BTC'}]},function(err,withdraw){
			!err && withdraw ? (
				BTCclient.sendToAddress(withdraw.wallet,parseFloat(withdraw.amount)/100000000,function (err, txid){
					err ? res.redirect('/skfjdhsdkjfhsdkjfk/admin/withdraw') : (
						Withdraw.update({'_id':id},{ $set : {'status' : 1 , 'txid' : txid}},function(err,result){
							res.redirect('/skfjdhsdkjfhsdkjfk/admin/withdraw');
						})
					)
				})
			) : res.redirect('/skfjdhsdkjfhsdkjfk/admin/withdraw')
		})
	}
}


module.exports = {
	ListWithdraw,
	ListWithdrawhistory,
	WithdrawSubmit
	
}