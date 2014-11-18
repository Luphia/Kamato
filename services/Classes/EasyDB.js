var defaultDriver = 'EasyMongo';

/*
	this.DB
 */

module.exports = function(driver) {
	var init = function(d) {
		!d && (d = defaultDriver);
		this.DB = require(d)
	},
		config: function() {},
		connect: function() {},
		disconnect: function() {},
		sql: function() {},
		listTable: function() {},
		getTable: function() {},
		getTable: function() {},
		postTable: function() {},
		putTable: function() {},
		deleteTable: function() {},
		listData: function() {},
		getData: function() {},
		postData: function() {},
		putData: function() {},
		deleteData: function() {};

	var db = {
		init: init,
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