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

var dataType = function(type) {
	// default type: String;
	var rtType = "String";
	if(typeof type == "object") { return 'JSON'; }
	else if(typeof type != 'string') { return rtType; }

	var typeList = ['String', 'Number', 'Date', 'Boolean', 'JSON', 'Buffer'];
	var searchList = [];
	for(var key in typeList) { searchList[key] = typeList[key].toLowerCase(); }
	si = searchList.indexOf(type.toLowerCase());

	if(si > -1) {
		rtType = typeList[si];
	}

	return rtType;
};

var setResult = function(result, next, _rs, _msg, _data) {
	_rs && result.setResult(_rs);
	_msg && result.setMessage(_msg);
	_data && result.setData(_data);
	next();
};
var tableExist = function(table) {
	var rs;

	var checkExist = function(_err, _data) {
		if(_err) {
			return rs = false;
		}

		if(_data.length > 0) {
			// return table exists
			rs = true;
		}
		else {
			rs = false;
		}
	};

	db.collection('_tables').find({'name': table}).toArray(checkExist);

	while(rs === undefined) {
		console.log('wait');
		require('deasync').runLoopOnce();
	}
	return rs;
};
var setSchema = function(table, schema) {
	var rs;

	var tableSchema = {
		"name": table,
		"max_serial_num": 0,
		"columns": {}
	};
	for(var key in schema) {
		if(key.indexOf('_', 0) == 0) { continue; }
		tableSchema.columns[key] = dataType(schema[key]);
	}

	var checkResult = function(_err, _data) {
		if(_err) {
			rs = false;
		}
		else {
			rs = true;
		}
	};

	db.collection('_tables').insert(tableSchema, checkResult);

	while(rs === undefined) {
		console.log('wait');
		require('deasync').runLoopOnce();
	}
	return rs;
};

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
		/*
			connect to DB
			return table names witch is not start with  'system.' or '_' 
		 */
		res.result = new Result();

		var parseTables = function(_err, _data) {
			if(_err) {
				setResult(res.result, next, 0, 'failed to connect to DB');
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

			setResult(res.result, next, 1, 'list table names', {"list": list});
		};

		db.collectionNames(parseTables);

	},
	getTable: function(req, res, next) {
		/*
			connect to DB
			check if the table exists
			column name must not start with '_'
		 */

		res.result = new Result();
		var table = req.params.table;

		var checkExist = function(_err, _data) {
			if(_err) {
				console.log(_err);
			}

			var tableSchema = {};

			var countDocs = function(_err, _count) {
				if(_err) {
					tableSchema['table_length'] = 0;
				}
				else {
					tableSchema['table_length'] = _count;
				}

				setResult(res.result, next, 1, 'get user table schema', tableSchema);
			};

			if(_data.length > 0) {
				// return table exists
				tableSchema = _data[0];
				for(var key in tableSchema) {
					if(key.indexOf('_', 0) == 0) {
						delete tableSchema[key];
					}
				}

				db.collection(table).count(countDocs);
			}
			else {
				setResult(res.result, next, 0, 'table not found');
			}
		};
		MongoClient.connect('mongodb://10.10.23.31:27010/easyDB', function(err, _db) {
			if(err) {
				console.log(err);
			}

			db = _db;
			db.collection('_tables').find({'name': table}).toArray(checkExist);
		});

	},
	postTable: function(req, res, next) {
		/*
			connect to DB
			check if the table exists
			column name must not start with '_'
		 */

		res.result = new Result();
		var table = req.params.table;

		MongoClient.connect('mongodb://10.10.23.31:27010/easyDB', function(err, _db) {
			if(err) {
				console.log(err);
			}

			db = _db;
			if(tableExist(table)) {
				setResult(res.result, next, 0, 'table already exist: ' + table);
			}
			else {
				if(setSchema(table, req.body)) {
					setResult(res.result, next, 1, 'create table: ' + table);
				}
				else {
					setResult(res.result, next, 0, 'create table failed: ' + table);
				}
			}
		});

	},
	putTable: function(req, res, next) {
		res.result = new Result();
		var table = req.params.table;

		if(setSchema(table, req.body)) {
			setResult(res.result, next, 1, 'update table: ' + table);
		}
		else {
			setResult(res.result, next, 0, 'update table failed: ' + table);
		}
	},
	delTable: function(req, res, next) {
		res.result = new Result();
		var table = req.params.table;

		var todo = 2;
		var done = function(_err, _data) {
			if(todo <= 0) { return false; }

			todo--;
			if(_err) {
				todo = 0;
				return setResult(res.result, next, 0, 'delete table failed: ' + table);
			}

			if(todo <= 0) {
				setResult(res.result, next, 1, 'delete table: ' + table);
			}
		}

		db.collection('_tables').findAndModify(
			{name: table},
			[],
			{},
			{remove: true},
			done
		);
		db.collection(table).remove(done);
	},

	postData: function(req, res, next) {
		res.result = new Result();
		var table = req.params.table;

		db.collection('_tables').findAndModify(
			{name: table},
			[],
			{$inc: {"max_serial_num": 1}},
			{},
			function(_err, _data) { console.log(_data.max_serial_num + 1); }
		);
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