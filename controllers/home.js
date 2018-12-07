'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');
const Ticker = require('../models/ticker');
const bitcoin = require('bitcoin');
const AstClient = new bitcoin.Client({
	host: 'localhost',
	port: 19668,
	user: 'santacoinrpc',
	pass: 'ASd1Q2HEGJJPnL5knD6Ez3qHhefDtySXp66vUT1TfuEQ',
	timeout: 30000
});

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
function getTemplateHome(req,res){
	// setupTicker();

	var affiliate = req.query.ref;


	if (affiliate != undefined) {
		User.findOne({
		    'displayName': affiliate
		}, function(err, user) {        
			if (err){

				res.render('home/home', {
					title: 'Home',
					layout: 'layout_home.hbs'
				});
			}
			if (user){
				// req.session.userId = user._id;
				// req.user = user;
				res.cookie('ref', affiliate, {expire: 86400000 + Date.now()});
				return res.redirect('/register');
			}else{
				return res.redirect('/');
			}
			
			
		})		
	}else{
		res.render('home/home', {
			title: 'Home',
			layout: 'layout_home.hbs'
		});
	}

	
}
function howtobuy(req,res){
	res.render('home/guide', {
					title: 'How to buy lencoin',
					layout: 'layout_home.hbs'
				});

	
}
function getTemplateBlogDetail(req,res){
	res.render('home/blog_detail', {
		title: 'Blog',
		layout: 'layout_home.hbs'
	});
}
function Ico(req,res){
	res.render('home/ico', {
		title: 'lencoin ICO | LEC',
		layout: 'layout_home.hbs'
	});
}

function InfoSTC(req, res){
	res.status(200).send(data)
	// AstClient.getInfo(function(err, info) {
	//   if (err) {
	//     return console.error(err);
	//   }
	//  var moneysupply = parseInt(info.moneysupply);
	//  var block = parseInt(info.blocks);
	//  var data = {
	//  	'block': block.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
	//  	'moneysupply': moneysupply.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") 
	//  };
	
	//  res.status(200).send(data)
	// });
}


module.exports = {
	getTemplateHome,
	getTemplateBlogDetail,
	Ico,
	InfoSTC,
	howtobuy
}