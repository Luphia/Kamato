var index = function(req, res){
	res.render('index');
};

var filters = require('./filters.js')
,	passport = require('./passport.js')
,	oauth2 = require('./oauth2.js')
,	user = require('./user.js')
,	easyDB = require('./easyDB.js')
,	manage = require('./manage.js')
,	demo = require('./demo.js')
;

var log4js, db;

module.exports = function(_config, _log4js, route) {
	var easyDBConfig = _config.get('mongo') || {}
	,	userConfig = {"userTable": "users", "driver": "EasyMongo", "option": {"url": easyDBConfig.uri}};

	log4js = _log4js;

	var logger = {
		info: log4js.getLogger('Kamato.INFO'),
		exception: log4js.getLogger('Kamato.EXCEPTION'),
		hack: log4js.getLogger('Kamato.HACK')
	};

	passport.init(_config, logger, route);
	filters.init(_config, logger, route);
	easyDB.init(easyDBConfig, logger, route);
	user.init(userConfig, logger, route);
	manage.init(easyDBConfig, logger, route);
	demo.init({}, logger, route);

	return {
		index: index,
		filters: filters,
		passport: passport,
		oauth2: oauth2,
		user: user,
		easyDB: easyDB,
		demo: demo
	}
};