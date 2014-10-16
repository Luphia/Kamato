var index = function(req, res){
	res.render('index');
};

var filters = require('./filters.js'),
	google = require('./google.js'),
	facebook = require('./facebook.js'),
	oauth2 = require('./oauth2.js'),
	user = require('./user.js'),
	easyDB = require('./easyDB.js');

var log4js;

module.exports = function(_config, _log4js) {
	var serverConfig = _config.get('server'),
		googleConfig = _config.get('google'),
		facebookConfig = _config.get('facebook'),
		easyDBConfig = _config.get('mongo');

	log4js = _log4js;

	var logger = {
		info: log4js.getLogger('Kamato.INFO'),
		exception: log4js.getLogger('Kamato.EXCEPTION'),
		hack: log4js.getLogger('Kamato.HACK')
	};

	googleConfig.callbackURL = serverConfig.url + "auth/google/return";
	googleConfig.clientID = googleConfig.client_id;
	googleConfig.clientSecret = googleConfig.client_secret;
	facebookConfig.callbackURL = serverConfig.url + "auth/facebook/return";

	filters.init(_config, logger);
	google.init(googleConfig, logger);
	facebook.init(facebookConfig, logger);
	easyDB.init(easyDBConfig, logger);

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