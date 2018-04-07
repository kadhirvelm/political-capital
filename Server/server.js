var R = require('ramda');

const port = process.env.APP_PORT;

const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const db = require('./config/db');
const cors = require('cors');
const http = require('http');
const app = express();


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use( function(req,res,next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Credentials', true);
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	res.setHeader('Content-Type', 'text/plain');
	next();
});

const server = http.createServer(app);

MongoClient.connect(db.url, (err, client) => {
  if (err) {
    return console.log(err);
  }

	var io = require('socket.io')(server);

  require('./Routes')(app, io, client.db('political_capital'));

  server.listen(port, () => {
    console.log(`Server running at port ${port}`);
  });

  app.get('/', (req, res) => {
    res.send('Political Capital Server Running');
  });

});
