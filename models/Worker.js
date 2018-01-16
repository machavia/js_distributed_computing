
exports.Worker = class {

	constructor( socket, taskManager ) {
		this.socket = socket;
		this.task = taskManager;
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

	sendTask( task ) {
		if( task === null) {
			this.socket.emit('wait', 5000 );
			return false;
		}
		console.log( 'rowid send ' + task['rowid'] );

		let ob = { id: task['rowid'], job_id: task['job_id'], batch: task['batch'] };
		this.socket.emit('new_task', ob);
	}


}