
class Main {

	constructor() {
		this.workers = navigator.hardwareConcurrency;
		this.workers = 1;
	}

	init() {
		console.log( this.workers + ' New workers will be spawned' );
		for (let i = 0; i < this.workers; i++) {
			new Worker("worker.js" );

		}
	}

	test() {

		var workerId = Sdk.generateWorkerId(); //every worker as it own random id, it must be unique (out about multiple visitors x workers? maybe vId + workerId)
		var sdk = new Sdk( 'http://' + window.location.hostname + ':3000/', workerId ); //establishing a new web socket connection with Colony

		console.log( 'New Worker. wId:' + workerId );


		//when a task is sent by the Colony via WebSocket, the worker will handle it here
		//This is a event base function
		sdk.handleNewTask(( task ) => {

			let message = task; //complete message sent by Colony
			if( message['batch'] == undefined || message['params'] == undefined  ) return false;

			let data = JSON.parse( message.batch );
			let params = JSON.parse( message.params );
			let state = null;
			if(  message['state'] !== null ) state = message.state;


			/***
			 * Computing part
			 * Do whatever you want to do with the data send by the colony
			 */


			 //this is the past prediction state

			let modelParams = {
				hiddenSize : params.hidden_size,
				inputSize : data.xShape[1],
				init_weights : ( state === null ? null : state.iw),
				modelType: "RNNLSTM",
				nPredictions : 1,
				seqLength : data.xShape[0]

			};

			console.log( modelParams );

			var t0 = performance.now();
			deep_batch_train.doBatchFromScratch({
				batchSize: 8,
				x: data.x,
				y: data.y,
				xShape: data.xShape,
				iter: 0,
				learningRate: params.lr,
				modelParams: modelParams,
				momentum: params.momentum,
				optimizerType: params.optimizer_type,
				optimizerParams: ( state === null ? null : state.op)
			}).then( (result) => {

				let [weightInit, optimizerParams, costVal] = result;

				console.log( result );

				console.log("Mini-batch took " + (performance.now() - t0) + " milliseconds.")

				//End of computing part

				//Sending back the result to the colony
				var workerResult = {
					job_id: message['job_id'],
					task_id: message['id'],
					worker_id: workerId,
					result: result
				};

				sdk.sendResult(workerResult);

				setTimeout(function(){ location.reload(); }, 150 );

			}).catch((error) => {
				throw error;
			});


		});

	}
}

function predict() {

}