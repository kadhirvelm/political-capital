if(process.env.REACT_APP_DEBUG === 'sdlkfh'){
	module.exports = {
		url: 'mongodb://192.168.99.100:3002/political_capital'
	}
} else {
	console.log('Accessing mlab database')
	module.exports = {
		url: 'mongodb://admin:admin@ds133961.mlab.com:33961/political_capital'
	}
}