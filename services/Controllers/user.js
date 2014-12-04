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
, UserManager = require('../Classes/UserManager.js')
, EasyDB = require('../Classes/EasyDB.js');

var config
, logger
, easyDB
, userManager;

module.exports = {
    init: function (_config, _logger, _route) {
        config = _config;
        logger = _logger;
        easyDB = new EasyDB(config);
        easyDB.connect(config.option);
        userManager = new UserManager(easyDB);

        _route.get('/me', module.exports.data);

        _route.get('/login', module.exports.login);
        _route.get('/loginout', module.exports.login);
        _route.post('/addtoken', module.exports.login);
        _route.post('/register', module.exports.login);
        _route.get('/check', module.exports.login);

        _route.get('/oauth2/:platform', module.exports.outerLogin);
        _route.get('/oauth2/:platform/*', module.exports.outerLogin);
    },
    data: function (req, res, next) {
        var userData = req.session || {};
        userData.text = 'test! session msg and print session';
        userData.ip = req.connection.remoteAddress;
        res.send(userData);
    },
    login: function (req, res, next) {
        res.result = new Result();
        var data = req.body;
        var x = userManager.login(data);
        if (x == false) {
            res.result.response(next, 0, 'Login Fail');
            res.session = userManager.login(data);
            next();
        } else {
            res.result.response(next, 1, 'Login Success', x);
            res.session = x;
            next();
        };
    },
    outerLogin: function (req, res, next) {
        res.result = new Result();
        var params = {};

        for (var key in _req.query) {
            params[key] = _req.query[key];
        }
        for (var key in _req.params) {
            params[key] = _req.params[key];
        }

        res.result.response(next, 1, 'Login with: ' + _req.params.platform, data);
        //userManager.findByPlatform()
    }
};