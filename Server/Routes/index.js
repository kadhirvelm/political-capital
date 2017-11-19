const roomRoutes = require('./room_routes');

module.exports = function(app, io, db){
	roomRoutes(app, io, db);	
}