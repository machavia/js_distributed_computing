const { Task } = require('./Task');

exports.Worker = class {

	constructor( socket ) {
		this.socket = socket;
	}

	connect( id ) {
		this.woker_id = id
		console.log( 'Worker connected: ' + id );

		db.insert(
			'worker',
			{
				id: this.woker_id,
				connection_time:  Date.now(),
				last_claim:  Date.now(),
			}
			);
	}

	disconnect() {
		db.delete( 'worker', 'id =' + this.woker_id );
	}

	sendTask() {
		Task.getATask((result) => {
			console.log( 'sending task' );
			if( result['rowid'] === undefined ) return false;
			let ob = { id: result['rowid'], job_id: result['job_id'], batch: result['batch'] };
			//this.socket.emit('new_task', ob);
		});
	}

	sendMessage( message ) {
		this.socket.emit('chat message', message);
	}


}
