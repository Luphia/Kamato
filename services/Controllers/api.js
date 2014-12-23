var Result = require('../Classes/Result.js')
,	EasyDB = require('../Classes/EasyDB.js')
,	request = require('request')
,	url = require('url')
,	config
,	logger
,	DB
;

var config,
	logger;

var RouteAPI = function(req, res, next) {
		res.result = new Result();
		var method = "get"
		,	options = {
				"url": req.query.source || "http://opendata.epa.gov.tw/ws/Data/AQX/?$orderby=PSI&$skip=0&$top=1000&format=json"
			}
		,	sql = req.query.sql || '';
		;

		request[method](options, function(err, response, body) {
			var data;
			try {
				var tmpData = JSON.parse(body);

				data = DB.dataFind(tmpData, sql);
				res.result.response(next, 1, '', data);
			}
			catch(e) {
				console.log(e);
				data = [];
			}
		});
	}
,	init = function(_config, _logger, route) {
		config = _config;
		logger = _logger;
		DB = new EasyDB(config, logger);
		DB.connect({"url": config.uri});

		route.get('/api', RouteAPI);
	};

module.exports = {
	init: init
};