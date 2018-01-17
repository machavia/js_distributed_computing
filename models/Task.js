const { DataSource } = require('./DataSource');

exports.Task = class {

	constructor() {
		console.log( 'init Task' );
		this.dataSource = new DataSource( 'example.db' );
		this.taskId = false;
		this.taskSend = 0;
		this.state = null;

	}

	async getATask( workerId ) {

		if( this.dataSource.epoch == 10 ) return { worker_id: workerId, status: 'end'};

		let nextBatch = [];
		await this.dataSource.next().then( (result) => nextBatch = result );

		if( this.taskSend >= 1 ) {
			return {worker_id: workerId, status: 'wait'};
		}

		this.taskSend++;
		this.taskId = this.generateId()
		let task = {
			taskId: this.taskId,
			worker_id: workerId,
			status: "ready",
			state: this.state,
			batch: JSON.stringify( nextBatch )
		};

		return task;

	}

	saveResult( taskid, result ) {
		if( taskid != this.taskId ) {
			console.log( 'Current task id not matching send task id with result' );
			return false;
		}

		this.taskSend = 0;
		this.state = result;
	}


	generateId() {
		let text = "";
		let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( let i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
		text = Date.now() + text;

		return text;
	}



}