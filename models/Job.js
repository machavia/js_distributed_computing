
exports.Job = class {

	constructor( jobId, params, dbOb ) {
		if( !Number.isInteger(jobId) ) throw new Error( 'Job id must be an integer');
		this.db = dbOb;
		this.id = jobId;
		this.params = params;
	}

	start() {
		this.db.update(
			'job',
			{
				status: 'running',
				time_begin: Date.now(),
			},
			'id= '+ this.id )
	}

	end( result ) {
		this.db.update(
			'job',
			{
				status: 'done',
				time_end: Date.now(),
				result: JSON.stringify( result )
			},
			'id= '+ this.id )
	}

	static getAvailableJobs( colonyId, count, dbOb ) {
		if( !Number.isInteger(colonyId) ) throw new Error( 'Colony id must be an integer');
		return dbOb.update(
			'job',
			{
				colony_id : colonyId,
			},
			'colony_id= 0 AND status = "waiting"', count  )
			.then(() =>
				dbOb.select( 'SELECT * FROM job WHERE colony_id= '+ colonyId + ' AND status = "waiting"')
			);

	}

}