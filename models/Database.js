const sqlite3 = require('sqlite3').verbose();

exports.Database = class {

	constructor(db_file='sq_lite.db') {
		this.db_path = __dirname + '/../db/' + db_file

        this.db = new sqlite3.Database(
            this.db_path, 
            (err) => { if( err ) console.error(err.message) }
        )   
	}

    open(obj=this) {
        return new Promise(
            function(resolve) {
                obj.db = new sqlite3.Database(
                    db_file, 
                    function(err) {
                        if(err) reject("Open error: "+ err.message)
                        else    resolve(path + " opened")
                    }
                )   
            }
        )
    }

	select(query, obj=this) {
		return new Promise(
            function(resolve, reject){
                obj.db.all(
                    query,
                    [],
                    (err, rows ) => {
                        if(err) reject("Read error: " + err.message)
                        else {resolve(rows)}
                    }
                )
            }
        );
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
