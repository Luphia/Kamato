var config, logger,
	passport = {};

var Result = require('../Objects/Result.js'),
	Google = require('../OAuth/Passport.google.js'),
	Facebook = require('../OAuth/Passport.facebook.js');

module.exports = {
	init: function(_config, _logger) {
		config = _config;
		logger = _logger;

		var serverConfig = _config.get('server') || {},
			googleConfig = _config.get('google') || {},
			facebookConfig = _config.get('facebook') || {};

		googleConfig.callbackURL = serverConfig.url + "auth/google/return";
		facebookConfig.callbackURL = serverConfig.url + "auth/facebook/return";

		passport.google = new Google(googleConfig);
		passport.facebook = new Facebook(facebookConfig);
	},
	file: function(req, res, next) {
		res.result = new Result();
		var filename = req.params[0];

		res.result.response(next, 3, '', {
			"path": passport.google.getPublic(filename)
		});
	},
	auth: function(req, res, next) {
		res.result = new Result();

		var platform = req.params.platform;
		res.result.response(next, 3, '', {
			"path": passport[platform].getAuthLink()
		});
	},
	authReturn: function(req, res, next) {
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
	}
};