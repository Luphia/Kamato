/*

listen: addAPI

 */

var Result = require('../Classes/Result.js')
,	EasyDB = require('../Classes/EasyDB.js')
,	request = require('request')
,	events = require('events')
,	util = require('util')
,	url = require('url')
,	config
,	logger
,	DB
,	easy
;

var Api = function() {};

util.inherits(Api, events.EventEmitter);

Api.prototype.RouteAPI = function(req, res, next) {
	res.result = new Result();
	var method = "get"
	,	options = {
			"url": req.query.source || "http://opendata.epa.gov.tw/ws/Data/AQX/?$orderby=PSI&$skip=0&$top=1000&format=json"
		}
	,	sql = req.query.sql || ''
	;

	var t1, t2, t3, t4;
	t1 = new Date();

	request[method](options, function(err, response, body) {
		var data;
		t2 = new Date();
		try {
			var tmpData = JSON.parse(body);

			data = DB.dataFind(tmpData, sql);
			t3 = new Date();
			res.result.setCost({
				"fetch": t2 - t1,
				"index": t3 - t2
			});
			res.result.response(next, 1, '', data);
		}
		catch(e) {
			console.log(e);
			data = [];
		}
	});
};
Api.prototype.run = function(req, res, next) {
	res.result = new Result();
	var API;
	var rs;
	var sql = req.query.sql;

	try {
		API = this.APIs[req.params.app][req.params.api];

		switch(API.type) {
			case 'sql':
				rs = this.SQL(API);
				break;

			case 'outer':
				rs = this.OUTER(API);

				if(sql) {
					rs = DB.dataFind(rs, sql);
				}
				break;

			default:
				rs = API;
				break;
		}

		res.result.response(next, 1, 'API exec', rs);
	}
	catch(e) {
		res.result.response(next, 0, 'API not found');
	}
};
Api.prototype.SQL = function(api) {
	var sql = api.config.sql.GET;
	var rs = easy.sql(sql);

	return rs;
};
Api.prototype.OUTER = function(api) {
	var rs
	,	method = "get"
	,	options = {
			"url": api.config.source[0]
		}
	,	sql = api.config.sql.GET
	;

	var t1, t2, t3, t4;
	t1 = new Date();

	request[method](options, function(err, response, body) {
		var data;
		t2 = new Date();
		try {
			var tmpData = JSON.parse(body);

			data = DB.dataFind(tmpData, sql);
			t3 = new Date();
			rs = data;
		}
		catch(e) {
			console.log(e);
			data = [];
			rs = data;
		}
	});

	while(rs === undefined) {
		require('deasync').runLoopOnce();
	}
	return rs;
};
Api.prototype.init = function(_config, _logger, route) {
	this.APIs = {};
	config = _config;
	logger = _logger;
	DB = new EasyDB(config, logger);
	easy = new EasyDB(config, logger);
	easy.connect({"url": config.uri + "easyDB"});

	DB.connect({"url": config.uri});
	var self = this;
	var APIs = DB.listData('api').list;

	for(var k in APIs) {
		this.addAPI( APIs[k] );
	}

	route.get('/api', function(req, res, next) {self.RouteAPI(req, res, next);});
	route.get('/api/:app/:api', function(req, res, next) {self.run(req, res, next);});
	route.get('/API/:app/:api', function(req, res, next) {self.run(req, res, next);});
};
Api.prototype.addAPI = function(API) {
	var owner = API.owner
	,	api = API.name
	;

	if(!this.APIs[owner]) {
		this.APIs[owner] = {};
	}

	this.APIs[owner][api] = API;
};

var api = new Api();

module.exports = api;