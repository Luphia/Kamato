/*
	"dependencies": {
		"mongodb": ">=1.4.9",
		"deasync": ">=0.0.7",
	}

	option: {
		uri: "mongodb://127.0.0.1:27017/",
		user: null,
		pass: null
	}
 */

var Collection = require('../Classes/Collection.js'),
	Mongo = require('mongodb'),
	Worker = require('../Classes/Worker.js'),
	Client = Mongo.MongoClient,
	dbURL,
	defaultDB = "mongodb://127.0.0.1:27017/",
	DB;

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

module.exports = function() {
	var connect = function(option, callback) {
		var rs;
		!option && (option = {});
		!option.url && (option.url = defaultDB);

		dbURL = url.parse(option.uri);

		option.protocol = 'mongodb:';
		option.slashes = true;
		option.host = dbURL.host;
		option.port = dbURL.port;

		MongoClient.connect(url.format(option), function(err, _db) {
			if(err) { callback(err); }
			else {
				callback(err, _db);
				DB = _db;
			}
		);
		return true;
	},
		disconnect = function() {
		return DB.close();
	},
		tableExist = function(table, callback) {
		DB.collection('_tables').find({'name': table}).toArray(function(err, data) {
			if(err) { callback(err); }
			else { callback(err, (data.length > 0)); }
		});
	},
		tableCount = function(table, callback) {
		DB.collection(table).count(function(err, count) {
			if(err) { callback(err); }
			else { callback(err, count); }
		});
	},
		getSchema = function(table, callback) {
		DB.collection('_tables').find({'name': table}).toArray(function(err, data) {
			if(err) { callback(err); }
			else {
				var rs;
				if(data.length > 0) {
					rs = data[0];
					delete rs._id;
					if(typeof rs.strick == 'undefined') { rs.strick = true; }
				}
				else {
					rs = false;
				}
				callback(err, rs);
			}
		});
	},
		setSchema = function(table, schema, callback) {
		var rs;

		var tableSchema = {
			"name": table,
			"max_serial_num": 0,
			"columns": {}
		};
		for(var key in schema) {
			if(key.indexOf('_', 0) == 0) { continue; }
			tableSchema.columns[key] = schema[key];
		}
		DB.collection('_tables').insert(tableSchema, function(err, data) {
			if(err) { callback(err); }
			else { callback(err, true); }
		});
	},
		getID = function(table, callback) {
		DB.collection('_tables').findAndModify(
			{'name': table}, 
			['max_serial_num'],
			{$inc: {"max_serial_num": 1}},
			{},
			function(err, data) {
				if(err) { callback(err); }
				else if(!data) { callback(err, 1); }
				else { callback(err, data.max_serial_num + 1); }
			}
		);
	},
		checkID = function(table, id, callback) {
		id = parseInt(id);

		if(!id) {
			callback(false, false);
			return false;
		}
		else {
			DB.collection('_tables').find({'name': table}).toArray(function(err, data) {
				if(err) { callback(err); }
				else if(!(data.length > 0) || data[0].max_serial_num < id) {
					DB.collection('_tables').findAndModify(
						{'name': table},
						['max_serial_num'],
						{$set: {"max_serial_num": id}},
						{},
						function(_err, _data) {
							if(_err) { callback(_err); }
							else { callback(_err, id); }
						}
					);
				}
				else {
					callback(err, data[0].max_serial_num);
				}
			});
		}
	},
		listTable = function(callback) {
		DB.collection('_tables').find().toArray(function(err, data) {
			if(err) { callback(err); }
			else {
				var list = [];
				for(var k in _data) {
					if(_data[k].name.replace(/^([^.]*)./, "").indexOf('system.', 0) == 0) {
						// do not show system table
					}
					else if(_data[k].name.replace(/^([^.]*)./, "").indexOf('_', 0) == 0) {
						// do not show protected table
					}
					else {
						list.push(_data[k].name);
					}
				}

				callback(err, list);
			}
		});
	},
		getTable = function(table, callback) {
		getSchema(table, function(err, schema) {
			if(err) { callback(err); }
			else if(schema) {
				tableCount(table, function(_err, count) {
					if(_err) { callback(_err); }
					else {
						schema.table_length = count;
						callback(_err, data);
					}
				});
			}
			else { callback(err, false); }
		});
	},
		postTable = function(table, schema, callback) {
		tableExist(table, function(err, exist) {
			if(err) { callback(err); }
			else {
				if(exist) {
					callback(err, false);
				}
				else {
					setSchema(table, schema, callback);
				}
			}
		});
	},
		putTable = function(table, schema, callback) {
		setSchema(table, schema, callback);
	},
		deleteTable = function(table, callback) {
		var todo = 2;
		var done = function(err) {
			todo--;
			if(todo <= 0) { return false; }

			if(err) { callback(err); }
			else if(todo <= 0) { callback(err, true); }
		};
		DB.collection('_tables').findAndModify(
			{name: table}, [], {}, {remove: true}, done
		);
		DB.collection(table).remove(done);
	},
		listData = function(table, callback) {

	},
		getData = function(query, callback) {},
		postData = function(query, callback) {},
		putData = function(query, callback) {},
		deleteData = function(query, callback) {};

	var MongoDB = {
		connect: connect,
		disconnect: disconnect,
		tableExist: tableExist,
		tableCount: tableCount,
		getSchema: getSchema,
		setSchema: setSchema,
		getID: getID,
		checkID: checkID,
		listTable: listTable,
		getTable: getTable,
		postTable: postTable,
		putTable: putTable,
		deleteTable: deleteTable,
		listData: listData,
		getData: getData,
		postData: postData,
		putData: putData,
		deleteData: deleteData
	};

	return MongoDB;
};