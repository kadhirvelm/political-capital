var _ = require('underscore');

module.exports = function(app, io, db) {

	app.get('/', (req, res) => {
		res.send('Political Capital Server Running - V 0.5.0');
	});

	var currentGameManagers = [];
	turnAllGameManagersOn();

	function reduceGamemanager(gameManager){
		return {
			_id: gameManager._id,
			settings: gameManager.settings,
		};
	}

	function createNewRoom(req, res){
		var gameManager = createGameManager(req.body.gameType, req.body._id);
		var newRoom = {_id: req.body._id, gameType: req.body.gameType, gameManager: reduceGamemanager(gameManager), inGame: false, players: {}, settings: {}};
		db.collection('rooms').insert(newRoom, (err, result) => {
			if (err) {
				res.send({'error': err});
			} else {
				currentGameManagers.push(gameManager._id);
				res.send(result.ops[0]);
			}
		});
  }

	app.post('/rooms', (req, res) => {
		if (!currentGameManagers.includes(req.body._id)) {
			createNewRoom(req, res);
		} else {
			res.status(400).send({'error': 'Duplicate game id not allowed.'});
		}
	});

	app.post('/rooms/exists', (req, res) => {
		db.collection('rooms').findOne({_id: parseInt(req.body._id, 10)}, (err, item) => {
			if (!_.isNull(item)){
				res.send({exists: true, room: item});
			} else {
				res.status(400).send({exists: false});
			}
		});
  });

  var GameManager = require('./GameManager');
	var CommonwealthGameManager = require('./CommonwealthGameManager');

	createGameManager = (gameType, id, settings) => {
		switch (gameType){
			case 'Commonwealth':
				return new CommonwealthGameManager(io, id, deleteRoom, db, settings);
			default:
				return new GameManager(io, id, deleteRoom, db, settings);
		}
  };

  function turnOnGameManager(item) {
		if (!currentGameManagers.includes(item._id)) {
			var gameManager = createGameManager(item.gameType, item._id, item.settings);
			currentGameManagers.push(gameManager._id);
		}
	}

	function turnAllGameManagersOn() {
		db.collection('rooms').find().toArray( function(err, items) {
      items.forEach((element) => turnOnGameManager(element));
		});
  }

  app.delete('/rooms', (req, res) => {
		const callback = (err) => {
			if (err){
				res.send({'error': err});
			} else {
				res.send({'message': req.body._id + ' deleted.'});
			}
		};
		deleteRoom(req.body._id, callback);
	});

  shutdownRoomSocket = (roomID) => {
    const gameManager = currentGameManagers.find((element) => element === roomID);
		if (gameManager){
			gameManager.disconnect();
		}
	};

	deleteRoom = (roomID, callback) => {
		shutdownRoomSocket(roomID);
    db.collection('rooms').deleteOne({_id: roomID}, callback);
    currentGameManagers.splice(currentGameManagers.indexOf(roomID), 1);
	};

};

String.prototype.replaceAll = function(str1, str2, ignore) {
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,'\\$&'),(ignore?'gi':'g')),(typeof (str2)=='string')?str2.replace(/\$/g,'$$$$'):str2);
};
