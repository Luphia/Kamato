var driverPath = '../DBDriver/'
,	defaultDriver = 'EasyMongo'
,	Collection = require('./Collection.js')
,	Parser = require('./Parser.js');

/*
	this.DB
	this.params = {
		driverPath,
		driver
	}
 */

var Schema = function(table) {
		return { "name": table, "max_serial_num": 0, "columns": {} };
	}
,	checkTable = function(table) {
		!table && (table = '');
		while(table.substr(0, 1) == '_') { table = table.substr(1); }
		return table;
	}
,	dataType = function(type) {
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
}
,	valueType = function(value) {
	var rs;
	if( !isNaN(Date.parse(value)) ) { rs = dataType("Date"); }
	else if( /^-?\d+(?:\.\d*)?(?:e[+\-]?\d+)?$/i.test(value) ) { rs = dataType("Number"); }
	else { rs = dataType(typeof value); }
	return rs;
}
,	parseSet = function(set) {
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
}
,	compareSchema = function(data, schema) {
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

module.exports = function(conf) {
	!conf && (conf = {});

	var init = function(config) {
		this.config(config);
		setDriver(config.driver);
	}
	,	setDriver = function(driver) {
		!!driver && (this.params.driver = driver);
		this.DB = require(this.params.driverPath + this.params.driver);
	}
	,	setDriverPath = function(path) {
		!!path && (this.driverPath = path);
	}
	,	config = function(config) {
		this.params = {
			driverPath: config.driverPath? config.driverPath: driverPath,
			driver: config.driver? config.driver: defaultDriver
		};
	}
	,	connect = function(option) {
		var rs;
		this.DB.connect(option, function(err) {
			rs = !err;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	disconnect = function() {
		this.DB.disconnect();
	}
	,	sql = function(sql) {
		var query = Parser.sql2ast(sql)
		,	operate;

		query.hasOwnProperty("SELECT") && (operate = "SELECT");
		query.hasOwnProperty("UPDATE") && (operate = "UPDATE");
		query.hasOwnProperty("INSERT INTO") && (operate = "INSERT");
		query.hasOwnProperty("DELETE FROM") && (operate = "DELETE");

		switch(operate) {
			case "SELECT":
				var table = query.SELECT[0].table;
				return this.listData(table, query);
				break;
			case "UPDATE":
				var table = query.UPDATE[0].table;
					schema = this.getSchema(table),
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
			case "INSERT":
				break;
			case "DELETE":
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
	}
	,	getID = function(table) {
		var rs;
		table = checkTable(table);

		this.DB.tableExist(table, function(err, data) {
			check = err? false: data;
		});

		while(check === undefined) {
			require('deasync').runLoopOnce();
		}

		if(!check) {
			this.postTable(table);
		}

		this.DB.getID(table, function(err, data) {
			rs = err? false: data;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	getSchema = function(table) {
		var rs;
		table = checkTable(table);

		this.DB.getSchema(table, function(err, data) {
			rs = err? false: data;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	setSchema = function(table, schema) {
		table = checkTable(table);
		var rs
		,	tableSchema = new Schema(table);

		for(var key in schema) {
			if(key.indexOf('_', 0) == 0) { continue; }
			tableSchema.columns[key] = dataType(schema[key]);
		}

		this.DB.setSchema(table, tableSchema, function(err, data) {
			rs = !err;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	setSchemaByValue = function(table, value) {
		table = checkTable(table);
		var rs
		,	tableSchema = new Schema(table);

		for(var key in value) {
			if(key.indexOf('_', 0) == 0) { continue; }
			tableSchema.columns[key] = valueType(value[key]);
		}

		this.DB.setSchema(table, tableSchema, function(err, data) {
			rs = !err;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	listTable = function() {
		var rs;

		this.DB.listTable(function(err, data) {
			rs = err? false: data;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	getTable = function(table) {
		table = checkTable(table);
		var rs;

		this.DB.getTable(table, function(err, data) {
			rs = err? false: data;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	postTable = function(table, schema) {
		table = checkTable(table);
		var rs;

		this.DB.postTable(table, schema, function(err, data) {
			rs = err? false: true;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	putTable = function(table, schema) {
		table = checkTable(table);
		var rs;

		this.DB.putTable(table, schema, function(err, data) {
			rs = err? false: data;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	deleteTable = function(table) {
		table = checkTable(table);
		var rs;

		this.DB.deleteTable(table, function(err, data) {
			rs = err? false: true;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	listData = function(table, query) {
		table = checkTable(table);
		var rs;

		this.DB.listData(table, query, function(err, data) {
			rs = err? false: data;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	getData = function(table, query) {
		var rs;

		this.DB.getData(table, query, function(err, data) {
			rs = err? false: data;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	postData = function(table, data) {
		var check, rs, id;
		table = checkTable(table);

		id = this.getID(table);
		data._id = id;
		this.DB.postData(table, data, function(err, data) {
			rs = err? false: id;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	putData = function(table, id, data) {
		table = checkTable(table);
		var rs,
			query = Parser.sql2ast("WHERE id = " + id);

		this.DB.putData(table, query, data, function(err, data) {
			rs = err? false: true;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	deleteData = function(table, id) {
		table = checkTable(table);
		var rs,
			query = Parser.sql2ast("WHERE id = " + id);

		this.DB.deleteData(table, query, function(err, data) {
			rs = err? false: true;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	};

	var db = {
		init: init,
		setDriver: setDriver,
		setDriverPath: setDriverPath,
		config: config,
		connect: connect,
		disconnect: disconnect,
		sql: sql,
		listTable: listTable,
		getTable: getTable,
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
	return db.init(conf);
}