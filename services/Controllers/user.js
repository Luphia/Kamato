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
        _route.get('/loginout', module.exports.loginout);
        _route.post('/addtoken', module.exports.addtoken);
        _route.post('/regist', module.exports.regist);
        _route.get('/check', module.exports.check);

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
        var s = req.session;
        if (x == false) {
            res.result.response(next, 0, 'Login Fail');
        } else {
            s._id = x._id;
            s.name = x.name;
            s.picture = x.picture;
            res.result.response(next, 1, 'Login Success', x);
        };
    },
    loginout: function (req, res, next) {
        res.result = new Result();
        req.session.destroy();
        res.result.response(next, 1, 'Session Destroy');
    },
    addtoken: function (req, res, next) {
        res.result = new Result();
        var data = req.body;
        var x = userManager.addToken(data);
        if (x == false) {
            res.result.response(next, 0, 'Addtoken Fail');
        } else {
            res.result.response(next, 1, 'Addtoken Success', x);
        };
    },
    regist: function (req, res, next) {
        res.result = new Result();
        var data = req.body;
        var x = userManager.addByPlatform(data);
        if (x == false) {
            res.result.response(next, 0, 'Regist Fail');
        } else {
            res.result.response(next, 1, 'Regist Success', x);
        };
    },
    check: function (req, res, next) {
        res.result = new Result();

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