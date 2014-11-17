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
	Result = require('../Classes/Result.js'),
	Collection = require('../Classes/Collection.js'),
	Parser = require('../Classes/Parser.js');

var config,
	logger,
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
			logger.exception.error(err);
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
var valueType = function(value) {
	var rs;
	if( !isNaN(Date.parse(value)) ) { rs = dataType("Date"); }
	else if( /^-?\d+(?:\.\d*)?(?:e[+\-]?\d+)?$/i.test(value) ) { rs = dataType("Number"); }
	else { rs = dataType(typeof value); }
	return rs;
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
			logger.exception.error(_err);
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
			logger.exception.error(_err);
			return rs = false;
		}

		if(_data.length > 0) {
			// return table exists
			rs = _data[0];
			delete rs._id;
			if(typeof rs.strick == 'undefined') { rs.strick = true; }
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
			logger.exception.error(_err);
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
var setSchemaByValue = function(table, value) {
	var rs;

	var tableSchema = {
		"name": table,
		"max_serial_num": 0,
		"columns": {}
	};
	for(var key in value) {
		if(key.indexOf('_', 0) == 0) { continue; }
		tableSchema.columns[key] = valueType(value[key]);
	}

	db.collection('_tables').insert(tableSchema, checkResult, function(_err) {
		logger.exception.error(_err);
		rs = !_err;
	});

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
				if(_err) {
					logger.exception.error(_err);
					rs = 1;
				}

				if(!_data) {
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
			if(_err) { logger.exception.error(_err); }
			if(_err || !(_data.length > 0) || _data[0].max_serial_num < id) {
				db.collection('_tables').findAndModify(
					{'name': table},
					['max_serial_num'],
					{$set: {"max_serial_num": id}},
					{},
					function(_err, _data) {
						if(_err) { logger.exception.error(_err); }
						rs = true;
					}
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
var search = function(start, end, query) {
	// {"fieldname": {$lte:10, $gte:100}}
	var rs;
	if(query) {
		return query;
	}

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
};
var checkValue = function(value) {
	var rs;

	if( /^-?\d+(?:\.\d*)?(?:e[+\-]?\d+)?$/i.test(value) ) { rs = parseFloat(value); }
	else if( !isNaN(Date.parse(value)) ) { rs = new Date(value); }
	else { rs = value; }

	return rs;
};
var parseValue = function(value) {
	var rs;

	value = value.trim();
	if(value.indexOf("'") == 0 || value.indexOf('"') == 0) {
		rs = value.substr(1, value.length - 2);
	}
	else {
		if(value == 'true') {
			rs = true;
		}
		else if(value == 'false') {
			rs = false;
		}
		else {
			rs = parseFloat(value);
		}
	}

	return rs;
};
var parseCondiction = function(ast) {
	var rs = {};
	!ast && (ast = {});
	if(ast.operator) {
		rs = {};
		switch(ast.operator) {
			case "=":
				rs[ast.left] = parseValue(ast.right);
				break;
			case "!=":
				rs[ast.left] = {"$ne": parseValue(ast.right)};
				break;
			case ">":
				rs[ast.left] = {"$gt": parseFloat(ast.right)};
				break;
			case ">=":
				rs[ast.left] = {"$gte": parseFloat(ast.right)};
				break;
			case "<":
				rs[ast.left] = {"$lt": parseFloat(ast.right)};
				break;
			case "<=":
				rs[ast.left] = {"$lte": parseFloat(ast.right)};
				break;
		}
	}
	else if(ast.logic) {
		var cond = [];
		for(var key in ast.terms) {
			cond.push(parseCondiction(ast.terms[key]));
		}

		switch(ast.logic) {
			case "and":
				rs = {"$and": cond};
				break;
			case "or":
				rs = {"$or": cond};
				break;
		}
	}

	return rs;
};
var checkQuery = function(query) {
	var rs;
	var tmp = query.toLowerCase();
	if(	tmp.indexOf("select") != 0 &&
		tmp.indexOf("update") != 0 &&
		tmp.indexOf("insert") != 0 &&
		tmp.indexOf("delete") != 0 &&
		tmp.indexOf("where") != 0) {

		rs = "WHERE " + query;
	}
	else {
		rs = query;
	}
	return rs;
};
var parseSet = function(set) {
	var rs = {};
	for(var key in set) {
		var tmp = set[key].expression,
			pos = tmp.indexOf("=");

		if(pos == -1) { continue; }

		var column = tmp.slice(0, pos),
			value = parseValue(tmp.slice(pos + 1));

		rs[column] = value;
	}

	return rs;
};
var dataTransfer = function(value, type) {
	if(typeof type != "string") { return checkValue(value); }
	var rs = value;
	if(value === null) { return null; }

	switch(type) {
		case "String":
			if(!value) {
				rs = "";
			}
			else {
				rs = value.toString();
			}
			break;

		case "Number":
			rs = isNaN(parseFloat(value))? null: parseFloat(value);
			break;

		case "Date":
			rs = isNaN(new Date(value))? null: new Date(value);
			break;

		case "Boolean":
			if(typeof value == 'string') { value = value.toLowerCase(); }
			switch(value) {
				case true:
				case "true":
				case "t":
				case 1:
				case "1":
					rs = true;
					break;

				case false:
				case "false":
				case "f":
				case 0:
				case "0":
					rs = false;
					break;

				default:
					rs = null;
					break;
			}

			break;

		case "JSON":
			rs = typeof value == 'object'? value: {};
			break;

		case "Buffer":
			break;
	}

	return rs;
};
var compareSchema = function(data, schema) {

	var rs = {};
	if(typeof schema != 'object' || !schema.strick) {
		for(var key in data) {
			rs[key] = dataTransfer(data[key]);
		}
	}
	else {
		for(var key in data) {
			rs[key] = dataTransfer(data[key], schema.columns[key]);
		}
	}

	return rs;
};

module.exports = {
	init: function(_config, _logger) {
		config = _config;
		logger = _logger;
		if(!config.uri) {
			config.uri = "mongodb://localhost:27017/";
		}
		dbURL = url.parse(config.uri);
		db = dbconn();
		return this;
	},
	route: function(req, res, next) {
		res.result = new Result();
		var routeURL = url.parse(req.originalUrl).pathname;

		var pass = (req.method == 'GET' && (routeURL.lastIndexOf('/') == routeURL.length - 1)? 'LIST': req.method) + routeURL.split('/').length.toString();
		switch(pass) {
			case 'LIST3':
				if(req.query.sql) {
					module.exports.execQuery(req, res, next);
				}
				else {
					module.exports.listTable(req, res, next);
				}
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
				if(req.query.q) {
					module.exports.queryForUpdate(req, res, next);
				}
				else {
					module.exports.putData(req, res, next);
				}
				break;
			case 'DELETE4':
				if(req.query.q) {
					module.exports.queryForDelete(req, res, next);
				}
				else {
					module.exports.delData(req, res, next);
				}
				break;

			default:
				setResult(res.result, next, 1, pass, {url: req.originalUrl, method: req.method});
				break;
		}
	},
	execQuery: function(req, res, next) {
		var query = Parser.sql2ast(req.query.sql),
			operate;

		query.hasOwnProperty("SELECT") && (operate = "SELECT" + query.SELECT.length);
		query.hasOwnProperty("UPDATE") && (operate = "UPDATE" + query.UPDATE.length);
		query.hasOwnProperty("INSERT INTO") && (operate = "INSERT" + query['INSERT INTO'].length);
		query.hasOwnProperty("DELETE FROM") && (operate = "DELETE" + query['DELETE FROM'].length);

		switch(operate) {
			case "SELECT1":
				break;
			case "UPDATE1":
				var table = query.UPDATE[0].table,
					schema = getSchema(table),
					cond = parseCondiction(query.WHERE),
					rowData = compareSchema( parseSet(query.SET), schema );
				db.collection(table).update(cond, {$set: rowData}, {multi: true, upsert: true}, function(_err, _data) {
					if(_err) {
						logger.exception.error(_err);
						return setResult(res.result, next, 0, 'update failed');
					}
					setResult(res.result, next, 1, 'number of affected rows: ' + _data);
				});
				break;
			case "INSERT1":
				break;
			case "DELETE1":
				var table = query['DELETE FROM'][0].table,
					cond = parseCondiction(query.WHERE),
					limit = query.LIMIT;
				db.collection(table).remove(cond, {justOne: limit && (limit.nb == 1)}, function(_err, _data) {
					if(_err) {
						logger.exception.error(_err);
						return setResult(res.result, next, 0, 'delete failed');
					}
					setResult(res.result, next, 1, 'number of affected rows: ' + _data);
				});
				break;
		}
	},
	listTable: function(req, res, next) {
		/*
			connect to DB
			return table names witch is not start with  'system.' or '_' 
		 */

		var parseTables = function(_err, _data) {
			if(_err) {
				logger.exception.error(_err);
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

		var table = checkTable(req.params.table),
			schema = getSchema(table);

		if(!schema) {
			setResult(res.result, next, 0, 'table not found');
		}
		else {
			db.collection(table).count(function(_err, _count) {
				if(_err) {
					logger.exception.error(_err);
					schema['table_length'] = 0;
				}
				else { schema['table_length'] = _count; }
				setResult(res.result, next, 1, 'get table schema: ' + table, schema);
			});
		}
	},
	postTable: function(req, res, next) {
		/*
			connect to DB
			check if the table exists
			column name must not start with '_'
		 */

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
		var table = checkTable(req.params.table);

		if(setSchema(table, req.body)) {
			setResult(res.result, next, 1, 'update table: ' + table);
		}
		else {
			setResult(res.result, next, 0, 'update table failed: ' + table);
		}
	},
	delTable: function(req, res, next) {
		var table = checkTable(req.params.table);

		var todo = 2;
		var done = function(_err, _data) {
			if(todo <= 0) { return false; }

			todo--;
			if(_err) {
				todo = 0;
				logger.exception.error(_err);
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
		var table = checkTable(req.params.table),
			start = parseInt(req.query.s),
			end = parseInt(req.query.e),
			pick = parseInt(req.query.p),
			query;
		req.query.q && (query = parseCondiction(Parser.sql2ast(checkQuery(req.query.q)).WHERE));

		// default pick 50 records
		if(!(pick >= 0)) {
			pick = 50;
		}

		//console.log(search(start, end));

 		var schema = getSchema(table);
		if(!schema) {
			setResult(res.result, next, 0, 'table not found');
		}

		db.collection(table).find(search(start, end, query)).sort({'_id': -1}).limit(pick).toArray(function(_err, _data){
			var collection = new Collection();

			if(_err) {
				logger.exception.error(_err);
				setResult(res.result, next, 1, 'list '+ table +' rows', collection.toJSON());
			}
			else {
				for(var key in _data) {
					collection.add( compareSchema(_data[key], schema) );
				}
				setResult(res.result, next, 1, 'list '+ table +' rows', collection.toJSON());
			}
		});
	},
	postData: function(req, res, next) {
		var table = checkTable(req.params.table),
			data = req.body,
			schema = getSchema(table);

		data['_id'] = getID(table);
		data = compareSchema(data, schema);

		db.collection(table).insert(data, function(_err, _data) {
			if(_err) {
				logger.exception.error(_err);
				setResult(res.result, next, 0, 'create new row failed');
			}
			else {
				setResult(res.result, next, 1, 'create new row in ' + table, {"_id": data['_id']});
			}
		});
	},
	getData: function(req, res, next) {
		var table = checkTable(req.params.table);
		var id = parseInt(req.params.id);
		var schema = getSchema(table);

		if(!schema) {
			return setResult(res.result, next, 0, 'table not found');
		}
		if(!id) {
			return setResult(res.result, next, 0, 'invalid row ID');
		}

		db.collection(table).find({"_id": id}).toArray(function(_err, _data) {

			if(_err) {
				logger.exception.error(_err);
				setResult(res.result, next, 0, 'row not found');
			}
			else if(_data.length == 0) {
				setResult(res.result, next, 0, 'row not found');
			}
			else {
				setResult(res.result, next, 1, 'get table row: ' + id, compareSchema(_data[0], schema) );
			}
		});
	},
	queryForUpdate: function(req, res, next) {
		var table = checkTable(req.params.table),
			schema = getSchema(table),
			query = Parser.sql2ast(checkQuery(req.query.q)),
			cond = parseCondiction(query.WHERE),
			limit = query.LIMIT,
			rowData = req.body;

		rowData = compareSchema(rowData, schema);

		db.collection(table).update(cond, {$set: rowData}, {multi: !(limit && limit.nb == 1), upsert: false}, function(_err, _data) {
			if (_err) {
				logger.exception.error(_err);
				setResult(res.result, next, 0, _err.message);
			}
			else { setResult(res.result, next, 1, 'number of affected rows: ' + _data); }
		});
	},
	queryForDelete: function(req, res, next) {
		var table = checkTable(req.params.table),
			query = Parser.sql2ast(checkQuery(req.query.q)),
			cond = parseCondiction(query.WHERE),
			limit = query.LIMIT;

		db.collection(table).remove(cond, {justOne: (limit && (limit.nb == 1))}, function(_err, _data) {
			if(_err) {
				logger.exception.error(_err);
				return setResult(res.result, next, 0, 'delete failed');
			}
			setResult(res.result, next, 1, 'number of affected rows: ' + _data);
		});
	},
	putData: function(req, res, next) {
		var table = checkTable(req.params.table),
			id = parseInt(req.params.id),
			schema = getSchema(table),
			rowData = req.body;

		if(!checkID(table, id)) {
			return setResult(res.result, next, 0, 'invalid row ID');
		}

		rowData['_id'] = id;
		rowData = compareSchema(rowData, schema);

		db.collection(table).update({_id: id}, rowData, {w:1, upsert: true}, function(_err) {
			if (_err) {
				logger.exception.error(_err);
				setResult(res.result, next, 0, _err.message);
			}
			else { setResult(res.result, next, 1, 'update table: ' + table + ', row: ' + id); }
		});
	},
	delData: function(req, res, next) {
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
				if(_err) {
					logger.exception.error(_err);
					setResult(res.result, next, 0, 'row not found');
				}
				else if(_data.length == 0) {
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
	},

	dbListData: function(table, cond) {
		var rs;
 		var schema = getSchema(table);

		if(!schema) { return []; }

		db.collection(table).find(cond).toArray(function(_err, _data) {
			if(_err) {
				logger.exception.error(_err);
				rs = [];
			}
			else {
				var collection = new Collection();
				for(var key in _data) {
					collection.add( compareSchema(_data[key], schema) );
				}
				rs = collection.toJSON();
			}
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}
		return rs;
	}
};