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
,	checkSQL = function(sql) {
	if(!sql || typeof sql != 'string') { return ''; }

	var tmp = sql.toLowerCase();

	if(
		tmp.indexOf("select") != 0 &&
		tmp.indexOf("update") != 0 &&
		tmp.indexOf("insert") != 0 &&
		tmp.indexOf("delete") != 0 &&
		tmp.indexOf("where") != 0
	) {
		sql = "WHERE " + sql;
	}

	return sql;
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
,	dataTransfer = function(value, type) {
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
}
,	parseData = function(data) {
	var type = typeof(data),
		rs = {};

	if(type != 'object') {
		key = '_' + type;
		rs[key] = data;
	}
	else {
		rs = data;
	}

	return rs;
}
,	checkValue = function(value) {
	var rs;

	if( /^-?\d+(?:\.\d*)?(?:e[+\-]?\d+)?$/i.test(value) ) { rs = parseFloat(value); }
	else if( !isNaN(Date.parse(value)) ) { rs = new Date(value); }
	else { rs = value; }

	return rs;
}
,	parseValue = function(value, type) {
	var rs;

	value = value.trim();
	if(value.indexOf("'") == 0 || value.indexOf('"') == 0) {
		rs = value.substr(1, value.length - 2);
		if(type) { rs = dataTransfer(rs, type); }
	}
	else {
		if(type) {
			rs = dataTransfer(value, type);
		}
		else if(value == 'true') {
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
}
var preCondiction = function(ast, schema) {
	!ast && (ast = {});
	!schema && (schema = {});
	if(ast.operator) {
		ast.right = parseValue(ast.right, schema[ast.left]);
	}
	else if(ast.logic) {
		for(var key in ast.terms) {
			ast.terms[key] = preCondiction(ast.terms[key], schema);
		}
	}

	return ast;
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
/*
var edb=require('./services/Classes/EasyDB.js');
var db = new edb();
db.connect({url: 'mongodb://10.10.23.31:27010/easyDB'})
db.listTable()
db.postTable('user', {name: 'String', birth: 'Date'})
db.postData('user', {name: 'A', birth: '1982-04-01'})
db.postData('user', {name: 'B', birth: '1988-09-18'})
db.postData('user', {name: 'B', birth: '1995-08-23'})
db.listData('user', "birth < '1990-01-01' and birth > '1984-01-01'");



db.postData('user', [{name: 'D', birth: '1982-05-01'}, {name: 'E', birth: '1982-06-01'}, {name: 'F', birth: '1982-07-01'}])
 */
module.exports = function(conf) {
	!conf && (conf = {});

	var init = function(config) {
		this.config(config);
		this.setDriverPath(config.driverPath);
		this.setDriver(config.driver);
		return this;
	}
	,	setDriver = function(driver) {
		!!driver && (this.params.driver = driver);
		this.DB = new require(this.params.driverPath + this.params.driver)();
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
					schema = this.getSchema(table).columns,
					cond = preCondiction(query.WHERE),
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
					cond = preCondiction(query.WHERE),
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
		var rs, check;
		table = checkTable(table);

		this.DB.tableExist(table, function(err, data) {
			check = err? false: data;
		});

		while(check === undefined) {
			require('deasync').runLoopOnce();
		}

		if(!check) {
			check = undefined;
			this.postTable(table, function(err, data) {
				check = err? false: data;
			});
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
	,	cleanTable = function(table) {
		table = checkTable(table);
		var rs;

		this.DB.deleteData(table, {}, function(err, data) {
			rs = err? false: true;
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

		if(!query) { query = '' }
		else {
			query = checkSQL(query);
		}

		var rs
		,	schema = this.getSchema(table).columns
		,	cond = Parser.sql2ast(query);
		cond.WHERE = preCondiction( cond.WHERE, schema );

		this.DB.listData(table, cond, function(err, data) {
			rs = err? false: data;
			if(err) { rs = false; }
			else {
				var collection = new Collection();
				for(var key in data) {
					collection.add( compareSchema(data[key], schema) );
				}
				rs = collection.toJSON();
			}
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	getData = function(table, id) {
		table = checkTable(table);
		var rs
		,	schema = this.getSchema(table)
		,	cond = Parser.sql2ast("WHERE _id = " + id);

		this.DB.getData(table, cond, function(err, data) {
			rs = err? false: compareSchema(data, schema);
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	postData = function(table, data) {
		var check, rs, schema, id = [];
		table = checkTable(table);
		schema = this.getSchema(table);

		if(data.length > 1) {
			for(var key in data) {
				data[key] = compareSchema(data[key], schema);
				data[key]._id = this.getID(table);
				id.push(data[key]._id);
			}
		}
		else {
			data = compareSchema(data, schema);
			data._id = this.getID(table);
			id.push(data._id);
		}

		this.DB.postData(table, data, function(err, data) {
			rs = err? false: id.join(', ');
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	putData = function(table, id, data) {
		table = checkTable(table);
		var rs, check
		,	schema = this.getSchema(table)
		,	query = Parser.sql2ast("WHERE _id = " + id);
		data = compareSchema(data, schema);

		this.DB.checkID(table, id, function(err, data) {
			check = err? false: data;
		});

		while(check === undefined) {
			require('deasync').runLoopOnce();
		}

		data._id = id;
		this.DB.putData(table, query, data, function(err, data) {
			rs = err? false: true;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	deleteData = function(table, query) {
		table = checkTable(table);
		var rs,	cond
		,	schema = this.getSchema(table);

		if(new RegExp('^[0-9]*$').test(query)) {
			cond = Parser.sql2ast("WHERE _id = " + query);
			cond.WHERE = preCondiction( cond.WHERE, schema );
		}
		else {
			query = checkSQL(query);

			cond = Parser.sql2ast(query);
			cond.WHERE = preCondiction( cond.WHERE, schema );
		}

		var x = 0;
		for(var key in cond) {
			x++;
		}
		if(x == 0) { return false; }

		this.DB.deleteData(table, cond, function(err, data) {
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
		getID: getID,
		getSchema: getSchema,
		setSchema: setSchema,
		listTable: listTable,
		getTable: getTable,
		getTable: getTable,
		postTable: postTable,
		putTable: putTable,
		cleanTable: cleanTable,
		deleteTable: deleteTable,
		listData: listData,
		getData: getData,
		postData: postData,
		putData: putData,
		deleteData: deleteData
	};
	return db.init(conf);
}