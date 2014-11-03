var config, logger,
	passport = {
		"google": require('./google.js'),
		"facebook": require('./facebook.js')
	};

module.exports = {
	init: function(_config, _logger) {
		config = _config;
		logger = _logger;

		var serverConfig = _config.get('server') || {},
			googleConfig = _config.get('google') || {},
			facebookConfig = _config.get('facebook') || {};

		googleConfig.callbackURL = serverConfig.url + "auth/google/return";
		googleConfig.clientID = googleConfig.client_id;
		googleConfig.clientSecret = googleConfig.client_secret;

		facebookConfig.callbackURL = serverConfig.url + "auth/facebook/return";

		passport.google.init(googleConfig, logger);
		passport.facebook.init(facebookConfig, logger);
	},
	file: function(req, res, next) {
		passport.google.file(req, res, next);
	},
	auth: function(req, res, next) {
		res.result = new Result();

		res.result.response(next, 3, '', {
			"path": passport.getAuthLink()
		});	
	},
	authReturn: function(req, res) {
		res.write("params:");
		res.write(JSON.stringify(req.params));
		res.write("\n");
		res.write("body:");
		res.write(JSON.stringify(req.query));
		res.end();
	}
};