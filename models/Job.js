const { DataSource } = require('./DataSource');

exports.Job = class {

	constructor() {

	}

	add( name, filePath ) {
		this.ds = new DataSource( filePath );
		this.ds.parse(50, (lines) => {

			db.insert( 'task', {
				job_id: 1,
				status: 'waiting',
				creation_time: Date.now(),
				batch: JSON.stringify( lines )
			})
		});
	}

}