const Database = require(__dirname + "/Database");

exports.DataSource = class {

	constructor( path ) {
		/*this.dataBase = new Database.Database('example.db');*/
		this.dataBasePromise = new Database.DatabasePromise('example.db');
	}

    next(){
        console.log("helloo");
    }

}
