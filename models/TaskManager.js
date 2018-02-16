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
			this.taskObs.push( new Task( job['id'], job['parameter'] ) );
		});
	}

	/**
	 * Check the least sent task and send it back
	 * @returns {Promise} from Task.getATask()
	 */
	async getATask() {

		let sentByTask = [];
        // use an array as a dict (using an enumeration would work too)
		Object.keys(this.taskObs).forEach(function (jobIndex) {
			let obj = this.taskObs[jobIndex];

			if( obj['status'] === 'done' ) {
				this.taskObs.splice(jobIndex, 1);
				return;
			}

			sentByTask[obj.sendCount] = jobIndex;

            console.log('sendCount', obj.sendCount, ' jobIndex ', jobIndex);

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
	 * @param {json|observerject} result
	 */
	saveResult( taskid, result ) {
		this.taskObs.forEach( (ob) => {
			if( ob.taskId ==  taskid ) ob.saveResult( taskid, result )
		});
	}

}
