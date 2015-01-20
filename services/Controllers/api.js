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
;

var Api = function() {};

util.inherits(Api, events.EventEmitter);

Api.prototype.RouteAPI = function(req, res, next) {
	res.result = new Result();
	var method = "get"
	,	options = {
			"url": req.query.source || "http://opendata.epa.gov.tw/ws/Data/AQX/?$orderby=PSI&$skip=0&$top=1000&format=json"
		}
	,	sql = req.query.sql || '';
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
Api.prototype.API = function(req, res, next) {
	res.result = new Result();	
};
Api.prototype.SQL = function(req, res, next) {

};
Api.prototype.OUTER = function(req, res, next) {

};
Api.prototype.init = function(_config, _logger, route) {
	config = _config;
	logger = _logger;
	DB = new EasyDB(config, logger);
	DB.connect({"url": config.uri});
	var self = this;
	var APIs = DB.listData('api');

	route.get('/api', function(req, res, next) {self.RouteAPI(req, res, next);});
	route.get('/API/:app/:api', function(req, res, next) {self.API(req, res, next);});
};

var api = new Api();
api.on('yo', function() { console.log('Yo'); });

module.exports = api;