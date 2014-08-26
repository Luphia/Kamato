var passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy;

var config,
	public_path = 'https://googledrive.com/host/';

module.exports = {
	init: function(_config) {
		config = _config;
		public_path += config.public_path + "/";



		passport.use(new FacebookStrategy(config.get('facebook'),
			function(accessToken, refreshToken, profile, done) {
				process.nextTick(function () {

					// find or create user profile
					console.log(profile);

					profile.identifier = identifier;
					return done(null, profile);
				});
			}
		));
	},
	callback: function(req, res) {
		var params = {
			uri: req.query,
			post: req.params
		};
		res.send(params);
	}
};