var _ = require('underscore');

const VERSION = '0.5.1';
const MILLISECONDS_PER_MINUTE = 1000 * 60;
const DELETE_INACTIVE_ROOMS_AFTER_SET_MINUTES = 20;
const DELETE_ACTIVE_ROOMS_AFTER_SET_MINUTES = 60 * 12;
var CURRENT_GAME_MANAGERS = {};

module.exports = function(app, io, db) {

	app.get('/', (req, res) => {
		res.send('Political Capital Server Running - V ' + VERSION);
  });

  /** Turning on game managers. */

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
		if (!Object.keys(CURRENT_GAME_MANAGERS).includes(item._id.toString())) {
			var gameManager = createGameManager(item.gameType, item._id, item.settings);
      CURRENT_GAME_MANAGERS[gameManager._id.toString()] = gameManager;
		}
	}

	function turnAllGameManagersOn() {
		db.collection('rooms').find().toArray( function(err, items) {
      items.forEach((element) => turnOnGameManager(element));
		});
  }

  /** Creating New Rooms. */

	function reduceGamemanager(gameManager){
		return {
			_id: gameManager._id,
			settings: gameManager.settings,
		};
	}

	function createNewRoom(req, res){
		var gameManager = createGameManager(req.body.gameType, req.body._id);
		var newRoom = {_id: req.body._id, gameType: req.body.gameType, gameManager: reduceGamemanager(gameManager), inGame: false, players: {}, settings: {}, timeStamp: new Date()};
		db.collection('rooms').insert(newRoom, (err, result) => {
			if (err) {
				res.send({'error': err});
			} else {
				CURRENT_GAME_MANAGERS[gameManager._id.toString()] = gameManager;
				res.send(result.ops[0]);
			}
		});
  }

	app.post('/rooms', (req, res) => {
		if (!Object.keys(CURRENT_GAME_MANAGERS).includes(req.body._id.toString())) {
			createNewRoom(req, res);
		} else {
			res.status(400).send({'error': 'Duplicate game id not allowed.'});
		}
  });

  /** Checking if a room exists before joining. */

	app.post('/rooms/exists', (req, res) => {
		db.collection('rooms').findOne({_id: parseInt(req.body._id, 10)}, (err, item) => {
			if (!_.isNull(item)){
				res.send({exists: true, room: item});
			} else {
				res.status(400).send({exists: false});
			}
		});
  });

  /** Deleting room logic. */

  app.delete('/rooms', (req, res) => {
		const callback = (err, item) => {
			if (err){
				res.send({'error': err});
			} else {
				res.send({'message': req.body._id + ' deleted.'});
			}
		};
		deleteRoom(req.body._id, callback);
	});

  shutdownRoomSocket = (roomID) => {
		if (CURRENT_GAME_MANAGERS[roomID.toString()]){
			CURRENT_GAME_MANAGERS[roomID.toString()].disconnect();
    }
    delete CURRENT_GAME_MANAGERS[roomID.toString()];
	};

	deleteRoom = (roomID, callback) => {
		shutdownRoomSocket(roomID);
    db.collection('rooms').deleteOne({_id: parseInt(roomID, 10)}, callback);
    console.log('Deleted Room - ' + roomID);
  };

  /** Timed loop, checking for inactive rooms. */

  function deleteStrayRoomsAfterInactivity(){
    db.collection('rooms').find().toArray( function(err, allRooms) {
      allRooms.forEach((room) => {
				const timeDifference = ((new Date().getTime() - new Date(room.timeStamp).getTime()) / MILLISECONDS_PER_MINUTE);
        if ((Object.keys(room.players).length === 0 && timeDifference > DELETE_ACTIVE_ROOMS_AFTER_SET_MINUTES) || (timeDifference > DELETE_ACTIVE_ROOMS_AFTER_SET_MINUTES)){
          this.deleteRoom(room._id);
        }
      });
		});
  };

  function deletingStrayRoomsLoop(){
    deleteStrayRoomsAfterInactivity();
    setTimeout(() => {
      deletingStrayRoomsLoop();
    }, DELETE_INACTIVE_ROOMS_AFTER_SET_MINUTES * MILLISECONDS_PER_MINUTE);
  }

  deletingStrayRoomsLoop();
  turnAllGameManagersOn();

};
