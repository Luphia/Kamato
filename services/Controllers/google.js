var active, config;
var public_path = 'https://googledrive.com/host/',
	passport = require('passport'),
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = {
	init: function(_config) {
		config = _config;
		public_path += config.public_path + "/";

		if(config.clientID) {
			passport.use(new GoogleStrategy(config,
				function(accessToken, refreshToken, profile, done) {
					process.nextTick(function () {

						// find or create user profile
						console.log(profile);

						profile.identifier = identifier;
						return done(null, profile);
					});
				}
			));

			active = true;
		}
	},
	file: function(req, res) {
		var filename = req.params[0];
		res.writeHead(307, {
			"Location": public_path + filename
		});
		res.end();
	},
	auth: passport.authenticate('google', { scope: [
		'https://www.googleapis.com/auth/userinfo.profile',
		'https://www.googleapis.com/auth/userinfo.email'
	] }),
	authReturn: function(req, res) {
		res.write(JSON.stringify(req.params));
		res.write(JSON.stringify(req.query));
		res.end();
	}
};