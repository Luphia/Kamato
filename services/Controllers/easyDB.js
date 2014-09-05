/*
	MongoDB Data Types
		- String
		- Number
		- Date
		- Buffer
		- Boolean
 */

var MongoClient = require('mongodb').MongoClient,
	format = require('util').format;

var config,
	db;

module.exports = {
	init: function(_config) {
		config = _config;
		MongoClient.connect(config.uri + 'easyDB', function(err, _db) {
			if(err) {
				console.log(err);
			}

			db = _db;
		});
	},
	data: function(req, res) {
		res.send('DB Connect');
		var collection = db.collection('test').find().limit(10).toArray(function(err, docs) {
			console.dir(docs);
		});
	},
	destroy: function() {
		db.close();
	}
};