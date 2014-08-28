var config;
var public_path = 'https://googledrive.com/host/',
	passport = require('passport'),
	GoogleStrategy = require('passport-google').Strategy;

module.exports = {
	init: function(_config) {
		config = _config;
		public_path += config.public_path + "/";

		passport.serializeUser(function(user, done) {
			done(null, user);
		});
		passport.deserializeUser(function(obj, done) {
			done(null, obj);
		});
		passport.use(new GoogleStrategy({
				returnURL: config.url + 'auth/google/return',
				realm: config.url
			},
			function(identifier, profile, done) {
				process.nextTick(function () {

					// find or create user profile
					console.log(profile);

					profile.identifier = identifier;
					return done(null, profile);
				});
			}
		));
	},
	file: function(req, res) {
		var filename = req.params.filename;
		res.writeHead(307, {
			"Location": public_path + filename
		});
		res.end();
	},
	auth: passport.authenticate('google'),
	authReturn: function(req, res) {
		res.write(JSON.stringify(req.params));
		res.write(JSON.stringify(req.query));
		res.end();
	}
};