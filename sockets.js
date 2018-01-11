var { Worker } = require('./models/Worker');
var sockets = {};

sockets.init = function (server) {

	var io = require('socket.io').listen(server);

	io.use((socket, next) => {
		let token = socket.handshake.query.token;
		if (isValid(token)) {
			return next();
		}
		return next(new Error('authentication error'));
	});

	io.on('connection', (socket) => {

		let token = socket.handshake.query.token;
		let worker = new Worker( socket );
		worker.connect( token );
		worker.sendMessage( 'Welcome to the chat')


		socket.on('chat message', function(msg){
			console.log( 'id ' + socket.id );
			worker.sendMessage( '-> message send')
		});

		socket.on('disconnect', function(){
			console.log('user disconnected');
		});
	});


}

module.exports = sockets;

function isValid( token ) {
	return true;
}