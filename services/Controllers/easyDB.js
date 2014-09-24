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
	url = require('url'),
	Server = require('mongodb').Server,
	format = require('util').format,
	Result = require('../Objects/Result.js'),
	Collection = require('../Objects/Collection.js');

var config,
	dbURL,
	db;

var dbconn = function(option) {
	var rs;

	!option && (option = {});
	option.protocol = 'mongodb:';
	option.pathname = '/easyDB';
	option.slashes = true;
	!option.host && (option.host = dbURL.host);
	!option.port && (option.port = dbURL.port);

	MongoClient.connect(url.format(option), function(err, _db) {
		if(err) {
			console.log(err);
			rs = false;
		}

		rs = _db;
	});

	while(rs === undefined) {
		require('deasync').runLoopOnce();
	}
	return rs;
}
var checkTable = function(table) {
	!table && (table = '');
	while(table.substr(0, 1) == '_') { table = table.substr(1); }
	return table;
}
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
		require('deasync').runLoopOnce();
	}
	return rs;
};
var getSchema = function(table) {
	var rs;

	db.collection('_tables').find({'name': table}).toArray(function(_err, _data) {
		if(_err) {
			return rs = false;
		}

		if(_data.length > 0) {
			// return table exists
			rs = _data[0];
		}
		else {
			rs = false;
		}
	});
	while(rs === undefined) {
		require('deasync').runLoopOnce();
	}
	return rs;
}
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
		require('deasync').runLoopOnce();
	}
	return rs;
};
var getID = function(table) {
	var rs;

	if(!tableExist(table)) {
		setSchema(table);
		return getID(table);
	}
	else {
		db.collection('_tables').findAndModify(
			{'name': table}, 
			['max_serial_num'],
			{$inc: {"max_serial_num": 1}},
			{},
			function(_err, _data) {
				if(_err || !_data) {
					rs = 1;
				}
				else {
					rs = (_data.max_serial_num + 1);
				}
			}
		);

	}

	while(rs === undefined) {
		require('deasync').runLoopOnce();
	}
	return rs;
};
var checkID = function(table, id) {
	var rs;
	id = parseInt(id);

	if(!id) {
		return false;
	}

	if(!tableExist(table)) {
		setSchema(table);
		return checkID(table, id);
	}
	else {
		db.collection('_tables').find({'name': table}).toArray(function(_err, _data) {
			if(_err || !(_data.length > 0) || _data[0].max_serial_num < id) {
				db.collection('_tables').findAndModify(
					{'name': table},
					['max_serial_num'],
					{$set: {"max_serial_num": id}},
					{},
					function(_err, _data) { rs = true; }
				);
			}
			else {
				rs = true;
			}
		});

	}

	while(rs === undefined) {
		require('deasync').runLoopOnce();
	}
	return rs;
};
var getIDRange = function(start, end) {
	// {"fieldname": {$lte:10, $gte:100}}
	var rs;

	var status = (!!start? '1': '0') + (!!end? '1': '0');
	switch(status) {
		case '11':
			if(start > end) {
				rs = {"_id": {$lte: start, $gte: end}};
			}
			else {
				rs = {"_id": {$lte: end, $gte: start}};
			}
			break;
		case '10':
			rs = {"_id": {$lte: start}};
			break;
		case '01':
			rs = {"_id": {$gte: end}};
			break;
		case '00':
		default:
			rs = {};
			break;
	}

	return rs;
}

module.exports = {
	init: function(_config) {
		config = _config;
		dbURL = url.parse(config.uri);
		db = dbconn();
	},
	route: function(req, res, next) {
		res.result = new Result();
		var routeURL = url.parse(req.originalUrl).pathname;

		var pass = (req.method == 'GET' && (routeURL.lastIndexOf('/') == routeURL.length - 1)? 'LIST': req.method) + routeURL.split('/').length.toString();
		switch(pass) {
			case 'LIST3':
				module.exports.listTable(req, res, next);
				break;
			case 'GET3':
				module.exports.getTable(req, res, next);
				break;
			case 'POST3':
				module.exports.postTable(req, res, next);
				break;
			case 'PUT3':
				module.exports.putTable(req, res, next);
				break;
			case 'DELETE3':
				module.exports.delTable(req, res, next);
				break;
			case 'LIST4':
				module.exports.listData(req, res, next);
				break;
			case 'GET4':
				module.exports.getData(req, res, next);
				break;
			case 'POST4':
				module.exports.postData(req, res, next);
				break;
			case 'PUT4':
				module.exports.putData(req, res, next);
				break;
			case 'DELETE4':
				module.exports.delData(req, res, next);
				break;

			default:
				setResult(res.result, next, 1, pass, {url: req.originalUrl, method: req.method});
				break;
		}
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
					list.push(_data[k].name);
				}
			}

			setResult(res.result, next, 1, 'list table names', {"list": list});
		};

		db.collection('_tables').find().toArray(parseTables);

	},
	getTable: function(req, res, next) {
		/*
			connect to DB
			check if the table exists
			column name must not start with '_'
		 */

		res.result = new Result();
		var table = checkTable(req.params.table);

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

		db.collection('_tables').find({'name': table}).toArray(checkExist);
	},
	postTable: function(req, res, next) {
		/*
			connect to DB
			check if the table exists
			column name must not start with '_'
		 */

		res.result = new Result();
		var table = checkTable(req.params.table);

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
	},
	putTable: function(req, res, next) {
		res.result = new Result();
		var table = checkTable(req.params.table);

		if(setSchema(table, req.body)) {
			setResult(res.result, next, 1, 'update table: ' + table);
		}
		else {
			setResult(res.result, next, 0, 'update table failed: ' + table);
		}
	},
	delTable: function(req, res, next) {
		res.result = new Result();
		var table = checkTable(req.params.table);

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

	listData: function(req, res, next) {
		res.result = new Result();
		var table = checkTable(req.params.table),
			start = parseInt(req.param('s')),
			end = parseInt(req.param('e')),
			pick = parseInt(req.param('p'));

		// default pick 50 records
		if(!(pick >= 0)) {
			pick = 50;
		}

		console.log(getIDRange(start, end));

 		var schema = getSchema(table);
		if(!schema) {
			setResult(res.result, next, 0, 'table not found');
		}

		db.collection(table).find(getIDRange(start, end)).sort({'_id': -1}).limit(pick).toArray(function(_err, _data){
			var collection = new Collection();

			if(_err) {
				setResult(res.result, next, 1, 'list '+ table +' rows', collection.toJSON());
			}
			else {
				for(var key in _data) {
					collection.add(_data[key]);
				}
				setResult(res.result, next, 1, 'list '+ table +' rows', collection.toJSON());
			}
		});
	},
	postData: function(req, res, next) {
		res.result = new Result();
		var table = checkTable(req.params.table),
			data = req.body;

		data['_id'] = getID(table);
		db.collection(table).insert(data, function(_err, _data) {
			if(_err) {
				setResult(res.result, next, 0, 'create new row failed');
			}
			else {
				setResult(res.result, next, 1, 'create new row in ' + table, {"_id": data['_id']});
			}
		});
	},
	getData: function(req, res, next) {
		res.result = new Result();
		var table = checkTable(req.params.table);
		var id = parseInt(req.params.id);

		if(!tableExist(table)) {
			return setResult(res.result, next, 0, 'table not found');
		}
		if(!id) {
			return setResult(res.result, next, 0, 'invalid row ID');
		}

		db.collection(table).find({"_id": id}).toArray(function(_err, _data) {

			if(_err || _data.length == 0) {
				setResult(res.result, next, 0, 'row not found');
			}
			else {
				setResult(res.result, next, 1, 'get table row: ' + id, _data[0]);
			}
		});
	},
	putData: function(req, res, next) {
		res.result = new Result();
		var table = checkTable(req.params.table);
		var id = parseInt(req.params.id);
		var rowData = req.body;

		if(!checkID(table, id)) {
			return setResult(res.result, next, 0, 'invalid row ID');
		}

		rowData['_id'] = id;

		db.collection(table).update({_id: id}, rowData, {w:1, upsert: true}, function(_err) {
			if (_err) setResult(res.result, next, 0, err.message);
			else setResult(res.result, next, 1, 'update table: ' + table + ', row: ' + id);
		});
	},
	delData: function(req, res, next) {
		res.result = new Result();
		var table = checkTable(req.params.table);
		var id = parseInt(req.params.id);

		if(!tableExist(table)) {
			return setResult(res.result, next, 0, 'table not found');
		}
		db.collection(table).findAndModify(
			{"_id": id},
			[],
			{},
			{remove: true},
			function(_err, _data) {
				!_data && (_data = []);
				if(_err || _data.length == 0) {
					setResult(res.result, next, 0, 'row not found');
				}
				else {
					setResult(res.result, next, 1, 'delete table row: ' + id);
				}
			}
		);
	},
	destroy: function() {
		db.close();
	}
};