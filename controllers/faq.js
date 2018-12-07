'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');

function Index(req,res){
	res.render('home/faq', {
		title: 'FAQS | lencoin',
		menu: 'faq',
		layout: 'layout_home.hbs'
	});
}

module.exports = {
	Index
}