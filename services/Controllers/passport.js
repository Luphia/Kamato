var config
,	logger
,	passport = {}
,	easyDB
,	userManager
;

var Result = require('../Classes/Result.js')
,	AuthModule = require('../Passport')
,	UserManager = require('../Classes/UserManager.js')
,	EasyDB = require('../Classes/EasyDB.js')
;

var auth = function(req, res, next) {
		res.result = new Result();
		var platform = req.params.platform;

		res.result.response(next, 3, '', {
			"path": passport[platform].getAuthLink()
		});
	},
	authReturn = function(req, res, next) {
		res.result = new Result();
		var platform = passport[req.params.platform];
		var data = req.query;

		if(platform) {
			var token = platform.getToken(data);
			var user = platform.getProfile(token);
			res.result.response(next, 1, 'login successful', user);
		}
		else {
			res.write("params:");
			res.write(JSON.stringify(req.params));
			res.write("body:");
			res.write(JSON.stringify(req.query));
			res.end();
		}
	};

module.exports = {
	init: function(_config, _logger, route) {
		config = _config;
		logger = _logger;
		userConfig = config.get('userConfig');
        easyDB = new EasyDB(userConfig);
        easyDB.connect(userConfig.option);
        userManager = new UserManager(easyDB);

		var serverConfig = _config.get('server') || {};

		for(var key in AuthModule) {
			var moduleName = key.toLowerCase();
			var moduleConfig = config.get(moduleName) || {};
			moduleConfig.callbackURL = serverConfig.url + "auth/" + moduleName + "/return";
			passport[moduleName] = new AuthModule[key](moduleConfig);
		}

		route.get('/oauth/:platform', auth);
		route.get('/oauth/:platform/return', authReturn);
	},
	file: function(req, res, next) {
		res.result = new Result();
		var filename = req.params[0];

		res.result.response(next, 3, '', {
			"path": passport.google.getPublic(filename)
		});
	}
};