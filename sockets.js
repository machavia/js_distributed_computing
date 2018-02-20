const { Job } = require('./models/Job');
const { TaskManager } = require('./models/TaskManager');
const { Worker } = require('./models/Worker');
const { Database } = require('./models/Database');
const dbOb = new Database( 'main.db');
var sockets = {};

/**
 * Handle connection from workers
 * @param server
 */
sockets.init = function (server) {

	var colonyId = Math.floor(Math.random() * Math.floor(99999)); //all the colonies must be listed in a global db server. Id must be given by this global host
	colonyId = 1;
	var taskManager = false;
	Job.getAvailableJobs( colonyId, 2, dbOb ).then( (result) => {
		taskManager = new TaskManager( result, dbOb );
	});


	var io = require('socket.io').listen(server);

	//check if the worker as a valid authentication.
	//for now this is not been used
	io.use((socket, next) => {
		let token = socket.handshake.query.token;
		if (isValid(token)) {
			return next();
		}
		return next(new Error('authentication error'));
	});

	//when a new connection is established by a worker
	io.on('connection', (socket) => {

		//auth token
		let token = socket.handshake.query.token;

		//creating new worker instance to keep conected worker in memory
		let worker = new Worker( socket );
		worker.connect( token ); //this is useless for now

		//when a worker send a result back
		socket.on('save_result', function(msg, callback){
			if( msg.task_id === undefined || msg.result === undefined ) {
				console.error( 'Missing task_id or result');
				return false;
			}
			taskManager.saveResult( msg.task_id, msg.result, dbOb );
			callback('received');

		});

		//when a worker disconnect
		socket.on('disconnect', function(){
			worker.disconnect();
			//console.log('user disconnected');
		});

		//pushing the first task to the worker
		taskManager.getATask( worker.woker_id ).then( (myTask) => {
			if( myTask !== null ) worker.sendTask( myTask )
		});

	});


};

module.exports = sockets;

/**
 * Validate the worker authentication
 * @param {string} token
 * @returns {boolean} is connection is valid
 */
function isValid( token ) {
	return true;
}
