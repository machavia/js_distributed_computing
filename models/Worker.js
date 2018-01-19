
exports.Worker = class {

	constructor( socket ) {
		this.socket = socket;
	}

	connect( id ) {
		this.woker_id = id
		console.log( 'Worker connected: ' + id );
		/*
		db.insert(
			'worker',
			{
				id: this.woker_id,
				connection_time:  Date.now(),
				last_claim:  Date.now(),
			}
			);
			*/
	}

	disconnect() {
		//db.delete( 'worker', 'id =' + this.woker_id );
	}

	sendTask( task ) {

		console.log( 'rowid send ' + task['taskId'] + ' to worker id ' + task['worker_id'] );
		let ob = {
			id: task['taskId'],
			state: task['state'],
			params: task['params'],
			batch: task['batch'],
		};
		this.socket.emit('new_task', ob);
	}


}
