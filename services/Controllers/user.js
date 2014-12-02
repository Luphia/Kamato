/*
	userprofile = {
		account
		password
		google
		facebook
		fitbit
		nike
		jawbone
		runkeeper
	}
 */

var Result = require('../Classes/Result.js')
,	UserManager = require('../Classes/UserManager.js')
,	EasyDB = require('../Classes/EasyDB.js');

var config
,	logger
,	easyDB
,	UserManager;

module.exports = {
	init: function(_config, _logger, _route) {
		config = _config;
		logger = _logger;
		easyDB = new EasyDB(config);
		easyDB.connect(config.option);
		userManager = new UserManager(easyDB);

		_route.get('/me', module.exports.data);
		_route.post('/login', module.exports.login);
	},
	data: function(req, res, next) {
	    var userData = req.session || {};
	    req.session.test = 'test session msg and print session';
		userData.ip = req.connection.remoteAddress;
		res.send(userData);
	},
	login: function(req, res, next) {
		res.result = new Result();
		var auth = {
			account: req.body.account,
			password: req.body.password
		};
		delete auth.password; //-- I don't know the hash rule of password

		var userData = easyDB.dbListData(config.userTable, auth);
		if(userData.length > 0) {
			var msg = "login success";
			res.result.response(next, 1, msg, userData[0]);
		}
		else {
			var msg = "login fail";
			res.result.response(next, 0, msg);
		}
	},
	outerLogin: function(req, res, next) {
		res.result = new Result();
		platform = req.params.platform;
	}
};