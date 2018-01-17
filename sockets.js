const { Worker } = require('./models/Worker');
const { Task } = require('./models/Task');
var sockets = {};

sockets.init = function (server) {

	var io = require('socket.io').listen(server);
	var taskManager = new Task();

	io.use((socket, next) => {
		let token = socket.handshake.query.token;
		if (isValid(token)) {
			return next();
		}
		return next(new Error('authentication error'));
	});

	io.on('connection', (socket) => {
		let token = socket.handshake.query.token;
		let worker = new Worker( socket, taskManager );
		worker.connect( token );

		socket.on('get_task', async function(msg){
			let myTask = {};
			await taskManager.getATask( msg['worker_id'] )
				.then( (result) => myTask = result);

			worker.sendTask( myTask );
		});

		socket.on('save_result', function(msg){
			console.log( 'Receiveing result ' + JSON.stringify(msg) );
			if( msg.task_id === undefined || msg.result === undefined ) {
				console.error( 'Missing task_id or result');
				return false;
			}
			taskManager.saveResult( msg.task_id, msg.result );
		});

		socket.on('disconnect', function(){
			worker.disconnect();
			console.log('user disconnected');
		});
	});


};

module.exports = sockets;

function isValid( token ) {
	return true;
}