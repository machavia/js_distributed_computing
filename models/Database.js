const sqlite3 = require('sqlite3').verbose();

exports.DatabasePromise = class {

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

}

exports.Database = class {

	constructor(db_file='sq_lite.db', defaultCreate=true) {
		//this.db = new sqlite3.Database(':memory:',  (err) => { if( err ) console.error(err.message) } );
		this.db = new sqlite3.Database(
            __dirname + '/../db/' + db_file,
            (err) => { if( err ) console.error(err.message) }
        );


        if(defaultCreate){
            this.db.run(
                "CREATE TABLE IF NOT EXISTS task ( " +
                "   job_id integer NOT NULL, status text NOT NULL, " +
                "   creation_time integer NOT NULL, batch text NOT NULL );"
            );
            this.db.run(
                "CREATE TABLE IF NOT EXISTS worker ( " +
                "   id integer PRIMARY KEY, " +
                "   connection_time integer NOT NULL," +
                "   last_claim integer NOT NULL );"
            );
        }
	}

	select( query, callback ) {

		return this.db.all(
            query,
            [],
            (err, rows ) => {
                if( err ) console.error(err.message)
                else callback( rows )
            }
        );
	}

	select_promise( query ) {

		return new Promise(
            function(resolve, reject){
                this.db.all(
                    query,
                    [],
                    (err, rows ) => {
                        if(err) reject("Read error: " + err.message)
                        else {
                            resolve(rows)
                        }
                    }
                )
            }
        );
	}

	update( table, data, where ) {
		let fields = Object.keys( data )
		fields = fields.map((field) => field + ' = (?)' ).join(',');
		let query = 'UPDATE ' + table + ' SET ' +fields + ' WHERE ' + where;

		let values = Object.values(data)
		console.log( query );
		this.db.run(query, values, (err) => { if( err ) console.error(err.message) } );
	}

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

	delete( table, where ) {
		let query = 'DELETE FROM ' + table + ' WHERE ' + where;
		this.db.run(query, [], (err) => { if( err )console.error(err.message) } );
	}

	close() {
		this.db.close();
	}
}
