'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Profitschema = new Schema({
	history : {
        type: {
            percent: { type: String, default: ""},
            date: { type: String, default: ""}
        }
    }
});



var Profit = mongoose.model('Profit', Profitschema);
module.exports = Profit;