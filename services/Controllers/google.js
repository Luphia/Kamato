var active, config, passport,
	public_path = 'https://googledrive.com/host/';

var	Result = require('../Objects/Result.js'),
	Passport = require('../OAuth/Passport.google.js');

module.exports = {
	init: function(_config) {
		config = _config;
		public_path += config.public_path + "/";

		passport = new Passport(config);
	},
	file: function(req, res, next) {
		res.result = new Result();
		var filename = req.params[0];

		res.result.response(next, 3, '', {
			"path": public_path + filename
		});
	},
	auth: function(req, res, next) {
		res.result = new Result();

		res.result.response(next, 3, '', {
			"path": passport.getAuthLink()
		});	
	},
	authReturn: function(req, res) {
		res.write(JSON.stringify(req.params));
		res.write(JSON.stringify(req.query));
		res.end();
	}
};