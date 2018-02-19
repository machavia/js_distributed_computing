const { DataSource } = require('./DataSource');
const { Job } = require('./Job');
const fs = require('fs');

/**
 * Task
 * A Task is an entity sent to a worker to be computed.
 * The content in the worker is served by the DataSource class
 */
exports.Task = class {

	constructor( jobId, params, dbOb ) {
		if( !Number.isInteger(jobId) ) throw new Error('Job id must be an integer');
		this.db = dbOb;
		this.job = new Job( jobId, params, dbOb );
		this.dataSource = new DataSource( 'example.db', params.batch_size);
		this.taskId = false; //unique task id
		this.sendCount = 0; //count of how many worker has received this task
		this.state = null; //the state of the task (!= status). This var 
        // contains the stats of the model to be sent with the next set of data
		this.currentBatch = false;
		this.status = 'waiting';
		this.job.start();

		this.iteration = 0;
		this.last_epoch = 0;

        this.save_every = 10; //TODO use
        this.save_location = "./data/weights"; //TODO use

        try {
            let setupContent = fs.readFileSync('task_setup.json');
            let setup = JSON.parse(setupContent);
            if(typeof(setup.cpu_count) === 'number' && setup.cpu_count !== -1){
                this.save_every = setup.save_every;
                console.log('setting save every at', setup.save_every);
            }
            this.save_location = setup.save_location;
        }
        catch(e){
            console.log(
                'could not read the task setup file, setting default values...'
            );
            console.log('original error', e);
        }

        if(! fs.existsSync(this.save_location)){
            try {
                fs.mkdirSync(this.save_location);
            }
            catch(e){
                console.log(e);
                throw new Error(
                    'could not create a save dir at the given location');
            }
        }
	}

	/**
	 * Get the next task for the job to be processed
	 * @param workerId
	 * @returns {Promise} task
	 */
	async getATask() {

		console.log(
            'Sending job ' + this.job.id
			+ ' epoch ' + this.dataSource.epoch +
            ' iteration ' + this.iteration);


		let nextBatch = [];

		// if we have received a result for the current task (or init) we want
        // to get a new task
		if(this.status == 'waiting') {
			this.status = 'running';
			this.taskId = this.generateId();
			await this.dataSource.next().then((result) => nextBatch = result);
			nextBatch = {
                'x' : nextBatch[0], 'xShape' : nextBatch[1],'y' : nextBatch[2]
            };
			this.currentBatch = nextBatch;
		}
		else {
			nextBatch = this.currentBatch;
		}

		this.sendCount++;

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
	 * #TODO: Make sure the state is correct by double (triple) checking it
     * with another result sent by another worker
	 * @param taskid
	 * @param result
	 * @returns {boolean}
	 */
	saveResult( taskid, result ) {

		if( taskid != this.taskId ) {
			console.log(
                'Current task id not matching send task id with result');
			return false;
		}
		this.iteration++;

		/**
		 * DEBUG
		 */
		this.db.insert( 'bench', {
			iteration: this.iteration,
			epoch : this.dataSource.epoch,
			cost_val : result[2],
            job_id: this.job.id,
            date: Date.now()
		});
        /*
            At some point you'd also want to save the weights of your model
            model_weights: result[0],
            optimizer_params: result[1]
        */
        
		console.log('Receiving result. Job id ' +  this.job.id + ' Cost val ' + result[2] + ' at ' +
            'iteration ' + this.iteration);
		result = {iw: result[0], op: result[1]};

        // Here we will save the weights that were found
        // every x batches AND at the end of every epoch !!!
        if(
            (this.iteration === 1) ||
            (this.iteration % this.save_every === 0) ||
            (this.last_epoch - this.dataSource.epoch > 0)
        ){
            let json = JSON.stringify(result);
            // zip (TODO put that in the browser part)

            fs.writeFileSync(
                this.save_location +
                '/return' +
                '_job_' + this.job.id +
                '_epoch_' + this.dataSource.epoch +
                '_iteration_' + this.iteration +
                '.json', json, 'utf8');
        }

        this.last_epoch = this.dataSource.epoch;

		// this.sendCount = 0; TODO (MARC) uncomment ?
        // for now, this insures that progress is done equally on each job
		this.state = result;

		//when a job is complete we need to pass the final result
		if( this.dataSource.epoch == 30 ){
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

		for( let i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
		text = Date.now() + text;

		return text;
	}



}
