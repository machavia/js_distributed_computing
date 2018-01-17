
exports.Worker = class {

	constructor( socket, taskManager ) {
		this.socket = socket;
		this.task = taskManager;
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

		if(task['worker_id'] === undefined ) {
			console.error( 'Can not send a task without worker id');
			return false
		}

		if( task.status == 'end') {
			console.log( 'Sending end command to worker ' + task['worker_id'] );
			this.socket.emit('end', {worker_id: task['worker_id']});
			return false;
		}

		if( task.status == 'wait') {
			console.log( 'Sending wait command to worker ' + task['worker_id'] );
			this.socket.emit('wait', {worker_id: task['worker_id'], time: 5000 });
			return false;
		}

		console.log( 'rowid send ' + task['taskId'] + ' to worker id ' + task['worker_id'] );
		let ob = {
			id: task['taskId'],
			worker_id: task['worker_id'],
			job_id: task['job_id'],
			batch: task['batch'],
			state: task['state']
		};
		this.socket.emit('new_task', ob);
	}


}
