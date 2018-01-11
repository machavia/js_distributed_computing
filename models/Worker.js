
exports.Worker = class {

	constructor( socket ) {
		this.socket = socket;
	}

	connect( id ) {
		this.woker_id = id
		console.log( 'Worker id ' + id );
	}

	disconnect() {

	}

	sendMessage( message ) {
		this.socket.emit('chat message', message);
	}


}