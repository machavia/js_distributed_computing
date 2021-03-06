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
	constructor( jobs, dbOb ) {
		this.taskObs = [];

		jobs.forEach( (job) => {
			this.taskObs.push( new Task( job['id'], job['parameter'], dbOb ) );
		});
	}

	/**
	 * Check the least sent task and send it back
	 * @returns {Promise} from Task.getATask()
	 */
	async getATask() {

		let sentByTask = [];

		for (let [jobIndex, obj] of Object.entries(this.taskObs)) {
			if( obj['status'] !== 'done' ) {
				sentByTask[obj.sendCount] = jobIndex;
				//console.log('sendCount', obj.iteration, ' jobIndex ', jobIndex);
			}
		}

		if( sentByTask.length == 0 ) {
			console.log( new Date().toISOString() + ' -> No task to send' );
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
