const sqlite3 = require('sqlite3').verbose();

exports.Database = class {

	constructor(db_file='main.db') {
		this.db_path = __dirname + '/../db/' + db_file

        this.db = new sqlite3.Database(
            this.db_path, 
            (err) => { if( err ) console.error(err.message) }
        )   
	}

	select(query ) {

		return new Promise(
            function(resolve, reject){
                this.db.all(
                    query,
                    [],
                    (err, rows ) => {
                        if(err) reject("Read error: " + err.message)
                        else {resolve(rows)}
                    }
                )
            }.bind( this )
        );
	}

	update( table, data, where, limit = false ) {

		return new Promise( function(resolve, reject) {

			let fields = Object.keys(data)
				fields = fields.map((field) => field + ' = (?)').join(',');

				if( limit != false) {
					where = 'rowid IN ( SELECT rowid FROM ' + table + ' WHERE '+ where + ' LIMIT ' + limit + ')'
				}
				let query = 'UPDATE ' + table + ' SET ' + fields + ' WHERE ' + where;

				let values = Object.values(data)
				this.db.run(query, values, (err) => {
					if (err) console.error(err.message)
					else( resolve() )
				});
			}.bind( this ));
	}

	/**
	 * #TODO: refactor it with Promises
	 * @param table
	 * @param data
	 */
	insert( table, data ) {
		let values = false;
		let fields = data
		if( data[0] !== undefined ) {
			fields = data[0]
			values = data;
		}
		else {
			values = [];
			values.push( data )
		}

		fields = Object.keys( fields )
		fields = fields.map((field) => field).join(',');


		let valuesStrings = [];
		values.forEach( (row) => {
			let values = Object.values(row)
			let line = values.map((value) => {
				if( typeof value == 'string') value = value.replace( "'", "\'");
				return "'" + value + "'"
			}).join(',');
			valuesStrings.push( line );
		});

		valuesStrings = valuesStrings.map( (line) => '(' + line + ')' ).join(',');

		let query = 'INSERT OR IGNORE INTO ' + table + ' ( ' + fields + ' ) VALUES ' + valuesStrings;
		this.db.run(query, [], (err) => { if( err )console.error(err.message) } );

	}

}