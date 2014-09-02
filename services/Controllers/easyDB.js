/*
	MongoDB Data Types
		- ObjectId
		- String
		- Number
		- Date
		- Buffer
		- Boolean
		- Mixed
		- Array
 */

var MongoClient = require('mongodb').MongoClient,
	format = require('util').format;

var config,
	db;

module.exports = {
	init: function(_config) {
		config = _config;
		MongoClient.connect(config.uri + 'easyDB', function(err, _db) {
			console.log(err);
			db = _db;
		});
	},
	data: function(req, res) {
		res.send('DB Connect');
	}
};


