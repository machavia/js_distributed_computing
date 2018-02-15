const { Database } = require('./Database');

exports.Job = class {

	constructor( jobId, params ) {
		if( !Number.isInteger(jobId) ) throw new Error( 'Job id must be an integer');
		this.db = new Database( 'main.db');
		this.id = jobId;
		this.params = params;
	}

	start() {
		/*this.db.update(
			'job',
			{
				status: 'running',
				time_begin: Date.now(),
			},
			'id= '+ this.id )*/
	}

	end( result ) {
		this.db.update(
			'job',
			{
				status: 'running',
				time_end: Date.now(),
				result: JSON.stringify( result )
			},
			'id= '+ this.id )
	}

	static getAvailableJobs( colonyId, count ) {
		if( !Number.isInteger(colonyId) ) throw new Error( 'Colony id must be an integer');
		let db = new Database( 'main.db');
		return db.update(
			'job',
			{
				colony_id : colonyId,
			},
			'colony_id= 0 AND status = "waiting"', count  )
			.then(() =>
				db.select( 'SELECT * FROM job WHERE colony_id= '+ colonyId + ' AND status = "waiting"')
			);

	}

}