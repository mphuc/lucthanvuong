'use strict'


const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config');

const server = require('http').Server(app);

const io = require('socket.io')(server);
const Ticker = require('./models/ticker');
const IcoSum = require('./models/icosum');
const request = require('request');
const rabbitmq = require('./rabbit_comfim');


/*io.on('connection', (socket)=>{
	console.log('1111111111111111');

	socket.on('getTicer', (data)=>{
		console.log('111111111111111122222222222222222222');
		setInterval(function(){
		let data = {};
		let price_usd;
	   	let ast_coin;
		request({
	        url: 'https://api.coinmarketcap.com/v1/ticker/bitcoin',
	        json: true
	    }, function(error, response, body) {
	    	
	    	if (!body || error) {
	    		console.log('error');
	    	}
			price_usd = parseFloat(body[0].price_usd);
			Ticker.findOne({},(err,data_ticker)=>{
				data.ast_usd = parseFloat(data_ticker.price_usd);
				data.ast_btc = parseFloat(data_ticker.price_btc);
				data.btc_usd = price_usd;
				var data_update = {
					$set : {
						'price_btc': parseFloat((data.ast_usd)/price_usd).toFixed(8),
						'btc_usd': price_usd
					}
				};

				Ticker.findOneAndUpdate({},data_update,(err,new_data_ticker)=>{
					if (error) {
					        console.log('error');
					    } else {

					    	request({
						        url: 'https://api.coinmarketcap.com/v1/ticker/ethereum',
						        json: true
						    }, function(error, response, body) {
						    	if (error) {
							        console.log('error');
							    } else {
							    	var eth_usd = parseFloat(body[0].price_usd);
									var eth_btc = parseFloat(body[0].price_btc);
									Ticker.findOne({},(err,data_ticker)=>{
										if (err) {
								        console.log('error');
									    } else {
									    	data.ast_usd = parseFloat(data_ticker.price_usd);
											data.ast_eth = parseFloat((data.ast_usd)/eth_usd).toFixed(8);
											data.ast_eth = parseFloat(data.ast_eth);
											data.eth_usd = eth_usd;
											data.eth_btc = eth_btc;
											var data_update = {
												$set : {
													'ast_eth': data.ast_eth,
													'eth_usd': eth_usd
												}
											};

											Ticker.findOneAndUpdate({},data_update,(err,new_data_ticker)=>{
												
												socket.emit('dataTicker', data)

											})
									    }
										

									})
							    }
								
							});
					    }
					

				})

			})


		});

	    socket.emit('ticker', 'Cow goes moo'); 
	}, 5000);
	});

	socket.on('getdataIco', (data)=>{
		var data = {};
		setInterval(function(){
			IcoSum.findOne({}, (err, sum) => {  
			    if (err) {
			        res.status(500).send(err);
			    } else {
			    	var total = parseFloat(sum.total).toFixed(8);
			    	var percent = parseFloat(total/6000000)*100;
			    	percent=percent.toFixed(2);
			    	data.percent = percent;
			    	data.total = parseFloat(total);
			    	socket.emit('dataIco', data)
			    }
			});	
		},6000);
		
	 });

})*/

mongoose.Promise = global.Promise;
mongoose.connect(config.db, {useMongoClient: true})
	.then(() => {
		//rabbitmq.start();
		//require('./socket/index.js')(io);
		//require('./socket/exchange.js')(io);
		server.listen(config.port, () =>{
			console.log(`Server Work http://localhost:${config.port}`);
		});
	})
	.catch(err => console.error(`Error al conectar a la DB: ${err}`));


