var R = require('ramda');
var _ = require('underscore');

module.exports = function(app, io, db) {

	var ObjectID = require('mongodb').ObjectID;

	var currentGameManagers = [];

	turnAllGameManagersOn();

	function reduceGamemanager(gameManager){
		return {
			gameManagerName: gameManager.namespace,
			roomID: gameManager.roomID,
			admin: gameManager.admin,
			settings: gameManager.settings,
		};
	}

	function createNewRoom(req, res, gameName){
		var gameManager = createGameManager(req.body.gameType || 'Vanilla', gameName, undefined, req.body.admin);
		var newRoom = {gameType: req.body.gameType || 'Vanilla', roomName: gameName, password: req.body.password, admin: req.body.admin, gameManager: reduceGamemanager(gameManager), inGame: false, players: {}, settings: {}};
		db.collection('rooms').insert(newRoom, (err, result) => {
			if (err) {
				res.send({'error': err});
			} else {
				gameManager.updateRoomID(result.ops[0]._id.toString());
				currentGameManagers.push(gameManager);
        res.send(result.ops[0]);
      }
		});
	}

	app.post('/rooms', (req, res) => {
		const gameName = req.body.roomName.replaceAll(' ', '%20');
		if (!R.contains(gameName.hashCode(), currentGameManagers)) {
      createNewRoom(req, res, gameName);
		} else {
			res.status(400).send({'error': 'Duplicate game name not allowed.'});
		}
	});

	app.get('/rooms', (req, res) => {
		db.collection('rooms').find().toArray( function(err, items) {
			R.forEach(turnOnGameManager, items);
			res.send(items);
		});
	});

	app.post('/room/exists', (req, res) => {
		const details = {'_id' : new ObjectID(req.body.roomID)};
		db.collection('rooms').findOne(details, (err, item) => {
			if (!_.isNull(item)){
				res.send({exists: true});
			} else {
				res.send({exists: false});
			}
		});
	});

	function turnAllGameManagersOn() {
		db.collection('rooms').find().toArray( function(err, items) {
			R.forEach(turnOnGameManager, items);
		});
	}

	function turnOnGameManager(item) {
		if (!containsGameManager(item._id.toString())) {
			var gameManager = createGameManager(item.gameType, item.roomName, item._id.toString(), item.admin, item.settings);
			currentGameManagers.push(gameManager);
		}
	}

	app.put('/rooms', (req, res) => {
		const details = {'_id' : new ObjectID(req.body.roomID)};
		const newRoom = {$set: {roomName: req.body.roomName.replaceAll(' ', '_'), password: req.body.password}};
		db.collection('rooms').update(details, newRoom, (err, result) => {
			if (err){
				res.send({'error': err});
			} else {
				res.send(result);
			}
		});
	});

	app.delete('/rooms', (req, res) => {
		const callback = (err, item) => {
			if (err){
				res.send({'error': err});
			} else {
				res.send({'message': req.body.roomID + ' deleted.'});
			}
		};
		shutdownRoomSocket(roomID);
		deleteRoom(req.body.roomID, callback);
	});

	containsGameManager = (roomID) => {
		return _.contains(_.pluck(currentGameManagers, 'roomID'), roomID.toString());
	};

	shutdownRoomSocket = (roomID) => {
		const gameManager = _.first(_.filter(currentGameManagers, (manager) => {
			return manager.roomID === roomID;
		}));
		if (gameManager){
			gameManager.disconnect();
		}
	};

	var GameManager = require('./GameManager');
	var CommonwealthGameManager = require('./CommonwealthGameManager');

	createGameManager = (gameType, gameManagerName, roomID, admin, settings) => {
		switch (gameType){
			case 'Commonwealth':
				return new CommonwealthGameManager(io, gameManagerName, roomID || 'PENDING', deleteRoom, db, admin, settings);
			default:
				return new GameManager(io, gameManagerName, roomID || 'PENDING', deleteRoom, db, admin, settings);
		}
	};

	deleteRoom = (roomID, callback) => {
		if (roomID !== 'PENDING') {
			shutdownRoomSocket(roomID);
			const details = {'_id' : new ObjectID(roomID)};
			console.log(roomID + ' should be deleted');
			db.collection('rooms').deleteOne(details, callback);
			currentGameManagers = R.filter( (gameManagerID) => gameManagerID === roomID, currentGameManagers);
		}
	};

};

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) {
    return hash;
  }
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

String.prototype.replaceAll = function(str1, str2, ignore) {
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,'\\$&'),(ignore?'gi':'g')),(typeof (str2)=='string')?str2.replace(/\$/g,'$$$$'):str2);
};
