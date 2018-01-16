
exports.Task = class {

	constructor() {
		console.log( 'init Task' );
		this.index = 0;
		this.taskId = false;
		this.taskSend = 0;

		db.select( 'SELECT rowid,* FROM task WHERE status = "waiting"', ( result ) => {
			this.tasks = result;
		});
	}

	getATask( workerId ) {

		if( this.index == this.tasks.length ) return { worker_id: workerId, status: 'end'};

		if( this.taskSend >= 1 ) {
			return {worker_id: workerId, status: 'wait'};
		}

		this.taskSend++;
		let task = this.tasks[this.index];
		this.taskId = task['rowid'];
		task['worker_id'] = workerId;
		return task;
	}

	saveResult( taskid, result ) {
		if( taskid != this.taskId ) {
			console.log( 'Current task id not matching send task id with result' );
			return false;
		}
		db.update( 'task', {status: 'done', result: result}, 'rowid =' + taskid );
		this.index++;
		this.taskSend = 0;
	}



}