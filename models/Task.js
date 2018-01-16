
exports.Task = class {

	constructor() {
		console.log( 'init Task' );
		this.index = 0;
		this.taskId = false;
		this.taskSend = 0;

		db.select( 'SELECT rowid,* FROM task', ( result ) => {
			this.tasks = result;
		});
	}

	getATask() {
		if( this.taskSend >= 5 ) {
			console.log( 'Task already sent 5 times' );
			return null;
		}
		this.taskSend++;
		let task = this.tasks[this.index];
		this.taskId = task['rowid'];
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