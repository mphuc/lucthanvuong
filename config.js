module.exports = {
	port : process.env.PORT || 5282,
	db: process.env.MONGODB || 'mongodb://wavetrade:CTwK8rUbchTLxaX3zyPDecxVUWK5Skjx5X@62.210.84.7:20097/wavetrade',
	SECRET_TOKEN: 'miclavedetokens' ,

	COIN : {
		host: 'localhost',
		port: 19668,
		user: 'bitbeelinerpc',
		pass: 'ApYJmRwZ2ZCE7cCNv8CJ94RVwPCMTpd94hefyoqdriXv',
		timeout: 30000
	},
	BTC : {
		host: 'localhost',
		port: 19668,
		user: 'bitbeelinerpc',
		pass: 'ApYJmRwZ2ZCE7cCNv8CJ94RVwPCMTpd94hefyoqdriXv',
		timeout: 30000
	}
}

