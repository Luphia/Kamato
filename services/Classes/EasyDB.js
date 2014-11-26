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

var checkTable = function(table) {
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
};

module.exports = function(driver) {
	var init = function() {
		this.config();
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
				break;
			case "UPDATE":
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

		this.DB.getSchema(table, function(err, data) {
			rs = err? false: data;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	setSchema = function(table, schema) {
		var rs;

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	}
	,	setSchemaByValue = function(table, value) {}
	,	listTable = function() {}
	,	getTable = function() {}
	,	getTable = function() {}
	,	postTable = function() {}
	,	putTable = function() {}
	,	deleteTable = function() {}
	,	listData = function() {}
	,	getData = function() {}
	,	postData = function() {}
	,	putData = function() {}
	,	deleteData = function() {};

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
	return db.init(driver);
}