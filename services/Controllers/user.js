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

        //master
        _route.post('/login', module.exports.login);
        _route.get('/loginout', module.exports.loginout);
        _route.get('/addtoken', module.exports.addtoken);
        _route.post('/regist', module.exports.regist);
        _route.get('/check', module.exports.check);
        _route.post('/forgot', module.exports.forgot);
        _route.post('/repassword', module.exports.repassword);

        //user
        _route.post('/ulogin', module.exports.ulogin);
        _route.get('/uloginout', module.exports.uloginout);
        _route.get('/uaddtoken', module.exports.uaddtoken);
        _route.post('/uregist', module.exports.uregist);
        _route.get('/ucheck', module.exports.ucheck);
        _route.post('/uforgot', module.exports.uforgot);
        _route.post('/urepassword', module.exports.urepassword);

        _route.get('/oauth2/:platform', module.exports.outerLogin);
        _route.get('/oauth2/:platform/*', module.exports.outerLogin);
    },
    data: function (req, res, next) {
        var userData = req.session || {};
        userData.ip = req.connection.remoteAddress;
        res.send(userData);
    },
    //master
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
            s.login = 1;
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
        var x = userManager.add(data);
        if (x == false) {
            res.result.response(next, 0, 'Regist Fail');
        } else {
            res.result.response(next, 1, 'Regist Success', x);
        };
    },
    check: function (req, res, next) {
        res.result = new Result();
        var s = req.session;
        if (s && s.name != null && s.login == 1) {
            res.result.response(next, 1, 'Check Success', s);
        } else {
            res.result.response(next, -2, 'Check Fail');
        };
    },
    forgot: function (req, res, next) {
        res.result = new Result();
        var data = req.body;
        var x = userManager.forgot(data);
        if (x == false) {
            res.result.response(next, 0, 'Forgot Fail');
        } else {
            res.result.response(next, 1, 'Forgot Success', x);
        };
    },
    repassword: function (req, res, next) {
        res.result = new Result();
        var data = req.body;
        var x = userManager.repassword(data);
        if (x == false) {
            res.result.response(next, 0, 'Repassword Fail');
        } else {
            res.result.response(next, 1, 'Repassword Success', x);
        };
    },
    //user
    ulogin: function (req, res, next) {
        res.result = new Result();
        var data = req.body;
        var x = userManager.ulogin(data);
        var s = req.session;
        if (x == false) {
            res.result.response(next, 0, 'Login Fail');
        } else {
            s._id = x._id;
            s.name = x.name;
            s.picture = x.picture;
            s.login = 1;
            res.result.response(next, 1, 'Login Success', x);
        };
    },
    uloginout: function (req, res, next) {
        res.result = new Result();
        req.session.destroy();
        res.result.response(next, 1, 'Session Destroy');
    },
    uaddtoken: function (req, res, next) {
        res.result = new Result();
        var data = req.body;
        var x = userManager.addToken(data);
        if (x == false) {
            res.result.response(next, 0, 'Addtoken Fail');
        } else {
            res.result.response(next, 1, 'Addtoken Success', x);
        };
    },
    uregist: function (req, res, next) {
        res.result = new Result();
        var data = req.body;
        var x = userManager.uadd(data);
        if (x == false) {
            res.result.response(next, 0, 'Regist Fail');
        } else {
            res.result.response(next, 1, 'Regist Success', x);
        };
    },
    ucheck: function (req, res, next) {
        res.result = new Result();
        var s = req.session;
        if (s && s.name != null && s.login == 1) {
            res.result.response(next, 1, 'Check Success', s);
        } else {
            res.result.response(next, -2, 'Check Fail');
        };
    },
    uforgot: function (req, res, next) {
        res.result = new Result();
        var data = req.body;
        var x = userManager.uforgot(data);
        if (x == false) {
            res.result.response(next, 0, 'Forgot Fail');
        } else {
            res.result.response(next, 1, 'Forgot Success', x);
        };
    },
    urepassword: function (req, res, next) {
        res.result = new Result();
        var data = req.body;
        var x = userManager.urepassword(data);
        if (x == false) {
            res.result.response(next, 0, 'Repassword Fail');
        } else {
            res.result.response(next, 1, 'Repassword Success', x);
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