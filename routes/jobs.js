var express = require('express');
var router = express.Router();

const { Job } = require('../models/Job');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.end('Welcome to jobs');
});

router.get('/add', function(req, res, next) {

	let j = new Job();
	j.add(  'test', __dirname + '/../public/ses.json' );

	res.end('Adding Job');

});

router.get('/get', function(req, res, next) {
	db.select( "SELECT rowid,status FROM task", (result ) => {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify(result));
	});

});


module.exports = router;
