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