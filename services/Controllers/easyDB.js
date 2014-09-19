/*
	MongoDB Data Types
		- String
		- Number
		- Date
		- Buffer
		- Boolean
 */

var MongoClient = require('mongodb').MongoClient,
	DB = require('mongodb').Db,
	Server = require('mongodb').Server,
	format = require('util').format,
	Result = require('../Objects/Result.js');

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
	listTable: function(req, res, next) {

		res.result = new Result();

		var parseTables = function(_err, _data) {
			if(_err) {
				res.result.setResult(0);
				res.result.setMessage('failed to connect to DB');
				res.result.setData({"list": list});

				return next();
			}

			var list = [];
			for(var k in _data) {
				if(_data[k].name.replace(/^([^.]*)./, "").indexOf('system.', 0) == 0) {

				}
				else if(_data[k].name.replace(/^([^.]*)./, "").indexOf('_', 0) == 0) {
					
				}
				else {
					list.push(_data[k].name.replace(/^([^.]*)./,""));
				}
			}

			res.result.setResult(1);
			res.result.setMessage('list table names');
			res.result.setData({"list": list});
			next();
		};

		db.collectionNames(parseTables);

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