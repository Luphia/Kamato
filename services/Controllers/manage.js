var Result = require('../Classes/Result.js')
,	EasyDB = require('../Classes/EasyDB.js')
,	url = require('url')
,	config
,	logger
,	DB

,	listTable = function(req, res, next) {
		res.result = new Result();
		var userID = req.session.userID;
		var data = connect(userID).listTable();
		res.result.response(next, 1, 'list all table', data);
	}
,	getSchema = function(req, res, next) {
		res.result = new Result();
		var userID = req.session.userID;
		var table = req.params.table;
		var data = connect(userID).getTable(table);

		if(data) {
			res.result.response(next, 1, 'table schema: ' + table, data);
		}
		else {
			res.result.response(next, 1, 'table not found: ' + table);
		}
	}
,	flowData = function(req, res, next) {
		res.result = new Result();
		var userID = req.session.userID;
		var table = req.params.table;
		var query = req.query.q;
		var data = connect(userID).flowData(table, query);

		if(data) {
			res.result.response(next, 1, 'Data in table : ' + table, data);
		}
		else {
			res.result.response(next, 1, 'table not found: ' + table);
		}
	}
,	postTable = function(req, res, next) { res.result.response(next, 1, pass, {url: req.originalUrl, method: req.method}); }
,	putTable = function(req, res, next) { res.result.response(next, 1, pass, {url: req.originalUrl, method: req.method}); }
,	delTable = function(req, res, next) { res.result.response(next, 1, pass, {url: req.originalUrl, method: req.method}); }
,	getData = function(req, res, next) {
		res.result = new Result();
		var userID = req.session.userID;
		var table = req.params.table;
		var id = req.params.id;
		var data = connect(userID).getData(table, id);

		if(data) {
			res.result.response(next, 1, 'Data in table : ' + table, data);
		}
		else {
			res.result.response(next, 1, 'table not found: ' + table);
		}
	}
,	postData = function(req, res, next) { res.result.response(next, 1, pass, {url: req.originalUrl, method: req.method}); }
,	updateData = function(req, res, next) { res.result.response(next, 1, pass, {url: req.originalUrl, method: req.method}); }
,	putData = function(req, res, next) { res.result.response(next, 1, pass, {url: req.originalUrl, method: req.method}); }
,	delData = function(req, res, next) { res.result.response(next, 1, pass, {url: req.originalUrl, method: req.method}); }
,	sql = function(req, res, next) {
		res.result = new Result();
		var userID = req.session.userID;
		var sql = req.body.sql || req.query.sql;
		var data = connect(userID).sql(sql);

		if(data) {
			res.result.response(next, 1, sql, data);
		}
		else {
			res.result.response(next, 1, 'sql error', sql);
		}
	}
,	connect = function(userID) {
		userID = 'easyDB'; //-- for demo

		if(!userID) { return false; }
		else if(DB[userID]) { return DB[userID]; }
		else {
			var db = new EasyDB(config)
			,	path = config.uri + userID
			;

			db.connect({"url": path});
			DB[userID] = db;
			return DB[userID];
		}
	}
,	dbRoute = function(req, res, next) {
		res.result = new Result();
		var routeURL = url.parse(req.originalUrl).pathname;

		var pass = (req.method == 'GET' && (routeURL.lastIndexOf('/') == routeURL.length - 1)? 'LIST': req.method) + routeURL.split('/').length.toString();
		var uri = routeURL.split('/');

		switch(pass) {
			case 'LIST4':
				if(req.query.sql) {
					sql(req, res, next);
				}
				else {
					listTable(req, res, next);
				}
				break;
			case 'GET4':
				getSchema(req, res, next);
				break;
			case 'POST4':
				postTable(req, res, next);
				break;
			case 'PUT4':
				putTable(req, res, next);
				break;
			case 'DELETE4':
				delTable(req, res, next);
				break;
			case 'LIST5':
				flowData(req, res, next);
				break;
			case 'GET5':
				getData(req, res, next);
				break;
			case 'POST5':
				postData(req, res, next);
				break;
			case 'PUT5':
				if(req.query.q) {
					update(req, res, next);
				}
				else {
					putData(req, res, next);
				}
				break;
			case 'DELETE5':
				delData(req, res, next);
				break;

			default:
				res.result.response(next, 1, pass, {url: req.originalUrl, method: req.method});
				break;
		}
	}
,	init = function(_config, _logger, route) {
		config = _config;
		logger = _logger;
		DB = {};

		// EasyDB
		route.all('/manage/db/', dbRoute);
		route.all('/manage/db/:table', dbRoute);
		route.all('/manage/db/:table/:id', dbRoute);
	}
;

module.exports = {
	init: init
}
;