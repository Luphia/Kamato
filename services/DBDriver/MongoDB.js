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
		db.collection('_tables').insert(tableSchema, function(err, data) {
			if(err) { callback(err); }
			else { callback(err, true); }
		});
	},
		getID = function(table, callback) {
		db.collection('_tables').findAndModify(
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
			db.collection('_tables').find({'name': table}).toArray(function(err, data) {
				if(err) { callback(err) }
				else if(!(data.length > 0) || data[0].max_serial_num < id) {
					db.collection('_tables').findAndModify(
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
		listTable = function() {},
		getTable = function() {},
		postTable = function() {},
		putTable = function() {},
		deleteTable = function() {},
		listData = function() {},
		getData = function() {},
		postData = function() {},
		putData = function() {},
		deleteData = function() {};

	var MongoDB = {
		connect: connect,
		disconnect: disconnect,
		tableExist: tableExist,
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