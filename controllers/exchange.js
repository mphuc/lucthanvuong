'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');

function Index(req,res){
	res.render('account/exchange', {
		title: 'Exchange',
		menu: 'exchange'
	});
}

module.exports = {
	Index
}