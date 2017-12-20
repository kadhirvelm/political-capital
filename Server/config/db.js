if (process.env.NODE_ENV === 'development'){
	module.exports = {
		url: process.env.MONGO_URL
	};
} else {
	console.log('Accessing mlab database');
	module.exports = {
		url: 'mongodb://admin:admin@ds133961.mlab.com:33961/political_capital'
	};
}
