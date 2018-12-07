module.exports = {
	port : process.env.PORT || 5989,
	db: process.env.MONGODB || 'mongodb://localhost:27017/lending_lencoin',
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

