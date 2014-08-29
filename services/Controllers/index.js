var index = function(req, res){
	res.render('index');
};

var google = require('./google.js'),
	facebook = require('./facebook.js'),
	oauth2 = require('./oauth2.js'),
	user = require('./user.js');

module.exports = function(_config) {
	var serverConfig = _config.get('server');
	var googleConfig = _config.get('google');
	var facebookConfig = _config.get('facebook');

	googleConfig.callbackURL = serverConfig.url + "auth/google/return";
	googleConfig.clientID = googleConfig.client_id;
	googleConfig.clientSecret = googleConfig.client_secret;
	facebookConfig.callbackURL = serverConfig.url + "auth/facebook/return";

	google.init(googleConfig);
	facebook.init(facebookConfig);

	return {
		index: index,
		google: google,
		facebook: facebook,
		oauth2: oauth2,
		user: user
	}
};