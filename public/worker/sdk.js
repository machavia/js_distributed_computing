
class Sdk {

	/***
	 * Establish a new connection with the Colony.
	 * @param host {string} End point of the Colony
	 * @param workerId {string} unique Worker Id
	 */
	constructor( host, workerId ) {

		var socket = io( host, {
			query: {
				token: workerId
			}
		});

		this.socket = socket;
		this.result = 0;
		this.workerId = workerId;
	}

	/**
	 * Disconnect from Colony
	 */
	disconnect() {
		this.socket.disconnect();
	}

	/**
	 * Ask the Colony for a new task to process.
	 * It send a message through the opened web socket but don't receive any answer
	 * @param workerId {string} Id of the SharedWorker
	 */
	claimNewTask( workerId ) {
		if( workerId === undefined ) {
			console.log( 'Unknown worker id' );
			return false;
		}
		this.socket.emit('get_task', {worker_id: workerId });
	}

	/**
	 * Handling new task send by the Colony
	 * After a "get_task" was sent to the Colony. It suppose to answer something...
	 * @param callback {function} what to do with task (if there is a task)
	 */
	handleNewTask( callback ) {

		//A proper new task has been sent. We forward it to the worker
		this.socket.on('new_task', (msg) => {
			console.log( 'Worker(' + this.workerId + '): Asked for a new task' );
			callback( msg );
		});
	}

	/**
	 * Worker has done his task.
	 * Time to send the result back to Colony
	 * @param result
	 */
	sendResult( result ) {
		this.socket.emit('save_result', result );
	}

	/**
	 * Generate a unique id with string and integers
	 * @returns {string} worker id
	 */
	static generateWorkerId() {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (var i = 0; i < 5; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}

	/**
	 * Sleep for a bit
	 * @param ms {int} time to sleep in ms
	 * @returns {Promise}
	 */
	static sleep(ms) {
		ms = ms || 0;
		return new Promise(function(resolve) {
			setTimeout(resolve, ms);
		});
	}
}