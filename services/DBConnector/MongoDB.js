module.exports = function() {
	var connect = function() {},
		disconnect = function() {},
		tableExist = function() {},
		getSchema = function() {},
		setSchema = function() {},
		getID = function() {},
		checkID = function() {},
		sql = function() {},
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
		sql: sql,
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