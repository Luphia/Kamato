var active, config;
var passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy;

module.exports = {
	init: function(_config) {
		config = _config;
		if(config.clientID) {
			passport.use(new FacebookStrategy(config,
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
	auth: passport.authenticate('facebook', { scope: 'read_stream' }),
	authReturn: function(req, res) {
		res.write(JSON.stringify(req.params));
		res.write(JSON.stringify(req.query));
		res.end();
	}
};