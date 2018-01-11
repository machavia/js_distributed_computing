var express = require('express');
var router = express.Router();
var path    = require("path");


/* GET home page. */
router.get('/', function(req, res, next) {
	let io = req.app.get('socketio');
	io.on('connection', function(socket){
		socket.broadcast.emit('chat message', 'Welcome!');

		socket.on('chat message', function(msg){
			console.log('message: ' + msg);
			io.emit('chat message', msg);
		});

		socket.on('disconnect', function(){
			console.log('user disconnected');
		});
	});

	res.sendFile(path.join(__dirname+'/../soketio.html'));
});


module.exports = router;
