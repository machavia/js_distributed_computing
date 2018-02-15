const { DataSource } = require('./DataSource');
const { Job } = require('./Job');

/**
 * Task
 * A Task is an entity sent to a worker to be computed.
 * The content in the worker is served by the DataSource class
 */
exports.Task = class {

	constructor( jobId, params ) {
		if( !Number.isInteger(jobId) ) throw new Error( 'Job id must be an integer');
		this.job = new Job( jobId, params )
		this.dataSource = new DataSource( 'example.db' );
		this.taskId = false; //unique task id
		this.taskSend = 0; //count of how many worker has received this task
		this.state = null; //the state of the task (!= status). This var contains the stats of the model to be sent with the next set of data
		this.currentBatch = false;
		this.status = 'waiting';
		this.job.start();

		this.iteration = 0;
	}

	/**
	 * Get the next task for the job to be processed
	 * @param workerId
	 * @returns {Promise} task
	 */
	async getATask() {

		console.log( 'Sending job ' + this.job.id + ' epoch ' + this.dataSource.epoch );

		if( this.dataSource.epoch == 10 ) return null;

		let nextBatch = [];

		//if we have received a result for the current task (or init) we want to get a new task
		if( this.status == 'waiting' ) {
			this.status = 'running';
			this.taskId = this.generateId()
			await this.dataSource.next().then( (result) => nextBatch = result );
			nextBatch = {'x' : nextBatch[0], 'xShape' : nextBatch[1],'y' : nextBatch[2] };
			this.currentBatch = nextBatch;
		}
		else {
			nextBatch = this.currentBatch;
		}

		this.taskSend++;

		let task = {
			taskId: this.taskId,
			state: this.state,
			params : this.job.params,
			batch: JSON.stringify( nextBatch )
		};

		return task;

	}

	/**
	 * Save the state of the model sent by the worker
	 * #TODO: Make sure the state is correct by double (triple) checking it with another result sent by another worker
	 * @param taskid
	 * @param result
	 * @returns {boolean}
	 */
	saveResult( taskid, result ) {

		if( taskid != this.taskId ) {
			console.log( 'Current task id not matching send task id with result' );
			return false;
		}
		this.iteration++;

		/**
		 * DEBUG
		 */
		const { Database } = require('./Database');
		let db = new Database( 'main.db');
		db.insert( 'bench', {
			iteration: this.iteration,
			epoch : this.dataSource.epoch,
			cost_val : result[2]
		});


		console.log( 'Receiveing result. Cost val ' + result[2] );
		result = { iw: result[0], op: result[1]};

		this.status = 'waiting';
		this.taskSend = 0;
		this.state = result;

		//when a job is complete we need to pass the final result
		if( this.dataSource.epoch == 10 ) {
			this.status = 'done';
			this.job.end( result );
		}
	}


	/**
	 * Generate a unique task id based on the current time stamp + random string
	 * @returns {string} unique id
	 */
	generateId() {
		let text = "";
		let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( let i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
		text = Date.now() + text;

		return text;
	}



}