const { Task } = require('./Task');

/**
 * Task manager
 * Distribute tasks by parallelizing jobs
 * Each job has one active task.
 * The Task Manager pick the next good task by handling each other status
 */
exports.TaskManager = class {

	/**
	 * For each job we init a Task class and we store it in this.taskObs
	 * @param jobs
	 */
	constructor( jobs ) {
		this.taskObs = [];

		jobs.forEach( (job) => {
			this.taskObs.push( new Task( job['id'] ) );
		});
	}

	/**
	 * Check the least sent task and sent it back
	 * @returns {Promise} from Task.getATask()
	 */
	async getATask() {

		let sentByTask = [];
		Object.keys(this.taskObs).forEach(function (key) {
			let obj = this.taskObs[key];

			if( obj['status'] === 'done' ) {
				this.taskObs.splice(key, 1);
				return;
			}

			sentByTask[obj.taskSend] = key;
		}.bind(this));

		if( this.taskObs.length == 0 ) {
			console.log( 'No task to send' );
			return null;
		}

		let min = Math.min.apply(null, Object.keys( sentByTask ));
		let ob = this.taskObs[ sentByTask[min] ];

		return ob.getATask();
	}

	/**
	 * Look for the right Task class that handling the given task it
	 * @param {string} taskid
	 * @param {json|object} result
	 */
	saveResult( taskid, result ) {
		this.taskObs.forEach( (ob) => {
			if( ob.taskId ==  taskid ) ob.saveResult( taskid, result )
		});
	}

}