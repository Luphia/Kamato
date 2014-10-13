var index = function(req, res){
	res.render('index');
};

var filters = require('./filters.js'),
	google = require('./google.js'),
	facebook = require('./facebook.js'),
	oauth2 = require('./oauth2.js'),
	user = require('./user.js'),
	easyDB = require('./easyDB.js');

module.exports = function(_config) {
	var serverConfig = _config.get('server'),
		googleConfig = _config.get('google'),
		facebookConfig = _config.get('facebook'),
		easyDBConfig = _config.get('mongo');

	googleConfig.callbackURL = serverConfig.url + "auth/google/return";
	googleConfig.clientID = googleConfig.client_id;
	googleConfig.clientSecret = googleConfig.client_secret;
	facebookConfig.callbackURL = serverConfig.url + "auth/facebook/return";

	filters.init(_config);
	google.init(googleConfig);
	facebook.init(facebookConfig);
	easyDB.init(easyDBConfig);

	return {
		index: index,
		filters: filters,
		google: google,
		facebook: facebook,
		oauth2: oauth2,
		user: user,
		easyDB: easyDB
	}
};