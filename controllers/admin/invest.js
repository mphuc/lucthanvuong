'use strict'

const User = require('../../models/user');
const Withdraw = require('../../models/withdraw');
const Ticker = require('../../models/ticker');
const Invest = require('../../models/invest');
const IcoSum = require('../../models/icosum');
const Profit = require('../../models/profit');

const Ico = require('../../models/ico');
const moment = require('moment');
const speakeasy = require('speakeasy');
const _ = require('lodash');
var sleep = require('sleep');
var cron = require('node-cron');
var forEach = require('async-foreach').forEach;
var dateFormat = require('dateformat');
cron.schedule('59 59 23 * * *', function(){
	//CaculateProfit();	
});
//CaculateProfit();

/*
let newProfit = new Profit();

newProfit.save(function(err,result){
	console.log(result)
});*/



function ListInvest(req, res){
	Invest.find({}, (err, data)=>{
		if (err) {
			res.status(500).send({'message': 'data not found'});
		}else{
			// res.status(200).send(data);
			var total = 0;
			var total_bbl = 0;
			var total_profit = 0;
			forEach(data, function(value, index){
				var done = this.async();
				total += parseFloat(value.amount);
				
				done();
				data.length - 1 === index && (
					res.render('admin/invest', {
						title: 'invest',
						layout: 'layout_admin.hbs',
						total : total,
						total_bbl : total_bbl,
						total_profit : total_profit,
						total : total,
						invest: data
					})
				)
			});
			
		}
	})
}

function CaculateProfit(req, res){
	/*console.log(req.body);
	let percent = parseFloat(req.body.percent),
		percent_today = parseFloat(req.body.percent),
		two =  parseInt(req.body.two),
		query={},
		data_update = {},
		interest = 0,
		commission = 0;

	var verified = speakeasy.totp.verify({
        secret: 'GRJTSPBQIM6D452GLA4CIYZDEU7T4KLUKRUTGQTWEM5HKPSNPFZA',
        encoding: 'base32',
        token: two
    });
    if (verified) 
    {*/

    if (req.body.percent && parseFloat(req.body.percent) > 0)
    {
    	
	   	Invest.find({}, function(err, data){
	   		if (err) 
	   		{
	   			console.log('no data');
	   		}
	   		else
	   		{
	   			var percent = 0;

	   			forEach(data, function(value, index){
					var done = this.async();

	   			//_.forEach(data, function(value,index ){
	       			if (parseFloat(value.amount) >= 100 && parseFloat(value.amount) < 1010)
	       			{
		                //percent = 1;
		                percent = parseFloat(req.body.percent);
	       			}
		            else if (parseFloat(value.amount) >= 1010 && parseFloat(value.amount) < 5010) 
		            {
		                //percent = 1.1;
		                percent = parseFloat(req.body.percent)+0.1;
		            }
		            else if (parseFloat(value.amount) >= 5010 && parseFloat(value.amount) < 10010) 
		            {
		                //percent = 1.23;
		                percent = parseFloat(req.body.percent)+0.15;
		            }
		            else if (parseFloat(value.amount) >= 10010 && parseFloat(value.amount) < 50010) 
		            {
		                //percent = 1.4;
		                percent = parseFloat(req.body.percent)+0.2;
		            }
		            else if (parseFloat(value.amount) >= 50010) 
		            {
		                //percent = 1.4;
		                percent = parseFloat(req.body.percent)+0.3;
		            }
		            console.log(percent);
		            
	       			User.findById(value.user_id, (err, users) => {

	       			 	if (err || !users || percent == 0)
	       			 	{
	       			 		console.log('Error');
	       			 	}
	       			 	else
	       			 	{	
	       			 		var amount_daily = parseFloat(percent)*parseFloat(value.amount)/100;
	       			 		var new_interest = parseFloat(value.interest)+parseFloat(amount_daily);

	       			 		var available = parseFloat(users.balance.lending_wallet.available);
				            var new_available = (parseFloat(available) + parseFloat(amount_daily)).toFixed(3);
				            var total_earn = (parseFloat(users.total_earn)).toFixed(3);
				            var new_total_earn = parseFloat(total_earn) + parseFloat(amount_daily);

				            var string = value.username + '----' +amount_daily + '------ ' + value.amount + ' ----- ' + percent +' ---' + new_interest+ '---' +new_available + ' ----------- ' +new_total_earn;
				            
				            console.log(string);

				            var query_update = { _id : value.user_id };
				            var data_update = { 
			                    $set: {
			                          'balance.lending_wallet.available': new_available,
			                          'total_earn': new_total_earn
			                      },
			                    $push: {
			                          'balance.lending_wallet.history': {
			                            'date': Date.now(), 
			                            'type': 'received', 
			                            'amount': parseFloat(amount_daily), 
			                            'detail': 'Get '+parseFloat(percent)+'% profit daily from package '+value.amount+' USD'
			                          }
			                        }
			                };
				            
				            User.update(query_update, data_update, function(err, UsersUpdate){
				            	var new_day;
								!err ? (
									new_day =  parseInt(value.days) - 1,
									Invest.update({_id : value._id}, {$set : {'interest' : new_interest, 'days' : new_day}}, function(err, UsersUpdate){
										console.log(data.length,index);
						            	data.length - 1 === index && (
						            		res.redirect('/skfjdhsdkjfhsdkjfk/admin/invest#complete'),
						            		Profit.update({},{$push: {
											      'history': {
											        'date': dateFormat(new Date().toLocaleString(), "yyyy-mm-dd"), 
											        'percent': parseFloat(req.body.percent)
											      }
											}},function(err,result){
												
											})
						            	);
						            	console.log('complete item');
						            	setTimeout(function() {
											done()
										}, 200);
									})
								) : (
									console.log('fail'),
									done()
								)
							})
	       			 	}
	       			});

				});
	       		 
	   		}
	   	
		})
	}
    /*} 
    else 
    {
        res.status(500).send({'message': 'Error Two Factor Authentication'});
    }*/

}

//update_lending_wallet();

function update_lending_wallet(){
	User.find({$and : 
		[
            {$where: 'this.total_invest >= '+parseFloat(0)+''}
        ]
	}
	,function(err,data){
		forEach(data, function(value, index){
			var done = this.async();

			if (value.balance.lending_wallet.history)
			{
				
				var history_lending = value.balance.lending_wallet.history;
				var count_for = history_lending.length;
				var balance_lending = 0;
				for (var i = 0; i < count_for; i++) {
					if (history_lending[i].type == 'received')
					{
						balance_lending += parseFloat(history_lending[i].amount);
					}
					else
					{
						balance_lending -= parseFloat(history_lending[i].amount);
					}
					
				}
				setTimeout(function() {
					var query_update = { _id : value._id };
		            var data_update = { 
	                    $set: {
	                          'balance.lending_wallet.available': balance_lending,
	                          'total_earn': parseFloat(balance_lending).toFixed(3)
	                    }
	                };

					User.update(query_update, data_update, function(err, UsersUpdate){
						console.log(index);
						done();
					})
					
				}, 500);
				
			}
			else
			{
				done();
			}

		})
	})
}




var p_node=[];
var i = 0;
var percent;
var amountInvest;

function InvestSubmit(req,res){
	//return res.status(404).send({error: 'amount', message: 'Comingsoon'})
	var amountUsd = parseFloat(req.body.amount);
	var user_id = req.body.uid;
	var displayName = req.body.displayName;
	
	LoopNode(amountUsd, 0, user_id, displayName, function (err) {
	  	p_node.reverse().join(' / ');
	  	console.log(p_node);
	  	
		res.redirect('/skfjdhsdkjfhsdkjfk/admin/customer#complete');
		
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


module.exports = {
	
	ListInvest,
	CaculateProfit,
	InvestSubmit
}