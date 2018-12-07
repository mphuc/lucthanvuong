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
const Order = require('../../models/order');

function ListIco(req, res){
	IcoSum.findOne({},(err,total_ico)=>{
		Order.find({status: '0'}, (err, data)=>{
			if (err) {
				res.status(500).send({'message': 'data not found'});
			}else{
				// res.status(200).send(users);
				res.render('admin/ico', {
					title: 'Ico',
					layout: 'layout_admin.hbs',
					ico: data,
					total_ico : total_ico
				});
			}
		})
	});
}


function ListIcohistory(req, res){
	Order.find({ $or : [{status: '1'},{status: '3'}]}, (err, data)=>{
		if (err) {
			res.status(500).send({'message': 'data not found'});
		}else{
			// res.status(200).send(users);
			res.render('admin/ico_history', {
				title: 'Ico',
				layout: 'layout_admin.hbs',
				ico: data
			});
		}
	})
}

function FindOrder(order_id,callback){
	Order.findById(order_id, (err, data) => {
		err || !data ? callback(false) : callback(data);
	 });
}

function EndICO(req, res){
	IcoSum.update({},{$set : {'status' : 0}},(err,result_order)=>{
		res.redirect('/skfjdhsdkjfhsdkjfk/admin/ico');
	}); 
	
}
function StartICO(req, res){
	IcoSum.update({},{$set : {'status' : 1}},(err,result_order)=>{
		res.redirect('/skfjdhsdkjfhsdkjfk/admin/ico');
	}); 
}
function TotalBuy(req, res){
	IcoSum.update({},{$set : {'total' :parseFloat(req.body.total)}},(err,result_order)=>{
		res.redirect('/skfjdhsdkjfhsdkjfk/admin/ico');
	}); 
}
function CanelICO(req, res){
	var query;
	var data;
	FindOrder(req.params.id,function(data){
		data && data.status == 0 ? (
			query = {_id:data._id},
			data = {$set : {'status': 3}},
			Order.update(query,data,function(err, newUser){
	           res.redirect('/skfjdhsdkjfhsdkjfk/admin/ico#success')
	        })
		): res.redirect('/skfjdhsdkjfhsdkjfk/admin/ico#error')
	})
}
var getUser = function(id_user,callback){
	User.findById(id_user, function(err, user) {
		err || !user ? callback(null) : callback(user);
	});
}
var update_balace_bbl = function(new_ast_balance,user_id,callback){
	var query = {_id:user_id};
	var data_update = {
		$set : {
			'balance.coin_wallet.available': parseFloat(new_ast_balance)
		}
	};
	User.update(query, data_update, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}
var update_balance_ico_add = function(user_id,amount,callback){
	getUser(user_id,function(user){
		if (user) 
		{
			var ast_balance = parseFloat(user.balance.coin_wallet.available);
			var new_ast_balance = parseFloat(ast_balance + amount).toFixed(8);
			update_balace_bbl(new_ast_balance,user._id,function(calb){
				calb ? callback(true) : callback(false);
			})
		}
		else
		{
			callback(false)
		}
	});
}


var update_balace_bch = function(new_ast_balance,user_id,callback){
	var query = {_id:user_id};
	var data_update = {
		$set : {
			'balance.bitcoincash_wallet.available': parseFloat(new_ast_balance)
		}
	};
	User.update(query, data_update, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}

var update_balace_btc = function(new_ast_balance,user_id,callback){
	var query = {_id:user_id};
	var data_update = {
		$set : {
			'balance.bitcoin_wallet.available': parseFloat(new_ast_balance)
		}
	};
	User.update(query, data_update, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}

var update_balace_ltc = function(new_ast_balance,user_id,callback){
	var query = {_id:user_id};
	var data_update = {
		$set : {
			'balance.litecoin_wallet.available': parseFloat(new_ast_balance)
		}
	};
	User.update(query, data_update, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}

var update_balace_dash = function(new_ast_balance,user_id,callback){
	var query = {_id:user_id};
	var data_update = {
		$set : {
			'balance.dashcoin_wallet.available': parseFloat(new_ast_balance)
		}
	};
	User.update(query, data_update, function(err, UsersUpdate){
		err ? callback(false) : callback(true);
	});
}



var update_balance_wallet = function(name_coin,amount_payment,user_id,callback){
	getUser(user_id,function(user){
		if (user) 
		{
			if (name_coin == 'BTC')
			{
				var ast_balance = parseFloat(user.balance.bitcoin_wallet.available);
				var new_ast_balance = parseFloat(ast_balance - amount_payment).toFixed(8);
				update_balace_btc(new_ast_balance,user._id,function(calb){
					calb ? callback(true) : callback(false);
				})
			}
			else if (name_coin == 'BCH')
			{
				var ast_balance = parseFloat(user.balance.bitcoincash_wallet.available);
				var new_ast_balance = parseFloat(ast_balance - amount_payment).toFixed(8);
				update_balace_bch(new_ast_balance,user._id,function(calb){
					calb ? callback(true) : callback(false);
				})
			}
			else if (name_coin == 'LTC')
			{
				var ast_balance = parseFloat(user.balance.litecoin_wallet.available);
				var new_ast_balance = parseFloat(ast_balance - amount_payment).toFixed(8);
				update_balace_ltc(new_ast_balance,user._id,function(calb){
					calb ? callback(true) : callback(false);
				})
			}
			else if (name_coin == 'DASH')
			{
				var ast_balance = parseFloat(user.balance.dashcoin_wallet.available);
				var new_ast_balance = parseFloat(ast_balance - amount_payment).toFixed(8);
				update_balace_dash(new_ast_balance,user._id,function(calb){
					calb ? callback(true) : callback(false);
				})
			}
		}
		else
		{
			callback(false)
		}
	});
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
								'detail': 'Get '+amount_coin*0.05+' SFCC from '+user_curent.displayName+' to buy '+amount_coin+' SFCC'
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


function MatchedICO(req, res){
	var query;
	var data_update;
	FindOrder(req.params.id,function(result_order){
		result_order && result_order.status == 0 ? (
			query = {_id:result_order._id},
			data_update = {$set : {'status': 1}},
			Order.update(query,data_update,function(err, newUser){

				var amount_coin_add = result_order.amount_coin;
				/*if (parseFloat(result_order.amount_coin)/100000000 >= 1000)
					amount_coin_add = parseFloat(result_order.amount_coin) + 5000000000
				if (parseFloat(result_order.amount_coin)/100000000 >= 2000)
					amount_coin_add = parseFloat(result_order.amount_coin) + 10000000000
				if (parseFloat(result_order.amount_coin)/100000000 >= 3000)
					amount_coin_add = parseFloat(result_order.amount_coin) + 18000000000
				if (parseFloat(result_order.amount_coin)/100000000 >= 4000)
					amount_coin_add = parseFloat(result_order.amount_coin) + 24000000000
				if (parseFloat(result_order.amount_coin)/100000000 >= 5000)
					amount_coin_add = parseFloat(result_order.amount_coin) + 40000000000
				if (parseFloat(result_order.amount_coin)/100000000 >= 10000)
					amount_coin_add = parseFloat(result_order.amount_coin) + 100000000000
				if (parseFloat(result_order.amount_coin)/100000000 >= 100000)
					amount_coin_add = parseFloat(result_order.amount_coin) + 1000000000000
*/
				update_balance_ico_add(result_order.user_id,parseFloat(amount_coin_add),function(cb_add){
					if (cb_add)
					{
						update_balance_wallet(result_order.method_payment,parseFloat(result_order.amount_payment),result_order.user_id,function(){
							IcoSum.findOne({}, (err, sum) => { 
								var total = (parseFloat(sum.total) + (parseFloat(result_order.amount_coin)/100000000)).toFixed(8);
						    	sum.total = parseFloat(total);
						        sum.save((err, sum) => {
						        	res.redirect('/skfjdhsdkjfhsdkjfk/admin/ico#success')
						        });
							});
						})
					}
				})
	        })
		): res.redirect('/skfjdhsdkjfhsdkjfk/admin/ico#error')
	})
}
module.exports = {
	ListIco,
	CanelICO,
	MatchedICO,
	ListIcohistory,
	EndICO,
	StartICO,
	TotalBuy
	
}