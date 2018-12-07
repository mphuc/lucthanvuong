'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');

function Index(req,res){
	res.render('home/partnerships', {
		title: 'Partnerships | Bitbeeline',
		layout: 'layout_partnerships.hbs'
	});
}

module.exports = {
	Index
}