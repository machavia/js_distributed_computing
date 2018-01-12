
exports.DataSource = class {

	constructor( path ) {

		this.lineReader = require('readline').createInterface({
			input: require('fs').createReadStream(path)
		});

	}

	parse( gap, callback ) {

		let lines = [];
		let linesCount = 0;

		this.lineReader.on('line', (line) => {
			line = JSON.parse( line )

			linesCount++;
			lines.push( line );
			if( linesCount >= gap ) {
				callback( lines );
				linesCount = 0;
				lines = [];
			}
		});

		this.lineReader.on('close', function() { callback( lines ) } );
	}
}