
exports.Task = class {

	constructor( name ) {

	}

	static getATask( callback ) {
		db.select( 'SELECT rowid,* FROM task WHERE status = "running" OR status = "waiting" ORDER BY status ASC, creation_time DESC LIMIT 1', ( result ) => {
			if( result.length > 1 ) {
				console.error( 'Get A Task suppose to return one task only')
				return false;
			}
			if( result.length > 0 ) {
				result = result[0];
				if( result.status == 'waiting' ) db.update( 'task', {status: 'running'}, 'rowid =' + result.rowid );
			}

			callback( result );
		});
	}

}