var config
, logger
, passport = {}
, easyDB = []
, userManager = []
, userConfig
;

var Result = require('../Classes/Result.js')
, AuthModule = require('../Passport')
, UserManager = require('../Classes/UserManager.js')
, EasyDB = require('../Classes/EasyDB.js')
;

var auth = function (req, res, next) {
    res.result = new Result();
    var platform = req.params.platform;
    var preAuth = passport[platform].getAuthLink();
    var authPath = typeof (preAuth) == 'object' ? preAuth.url : preAuth;

    (req.params.app) && (req.session.APP = req.params.app);

    !req.session.passport && (req.session.passport = {});
    req.session.passport[platform] = preAuth;

    res.result.response(next, 3, '', {
        "path": authPath
    });
}
, authReturn = function (req, res, next) {
    res.result = new Result();
    var uplatform = req.params.platform;
    var platform = passport[uplatform];
    var data = req.query;
    var db = easyDB;

    if (typeof data.error != 'undefined') {
        res.result.response(next, 0, 'authReturn Fail');
    };

    if (platform) {
        var preData = req.session.passport[platform];
        var token = platform.getToken(data, preData);

        var user = platform.getProfile(token);

        var app = req.session.APP;
        checkAPP(app);

        var s = req.session[app];

        if (s && s.ulogin == 1) {
            var id = s._id;
            var x = userManager[app].uaddToken({ _id: id, platform: uplatform, userData: token });
            if (x == false) {
                res.result.response(next, 0, 'UaddToken Fail#');
            } else {
                var y = userManager[app].uidaddByPlatform({ _id: id, platform: uplatform, userData: user });
                if (y == false) {
                    res.result.response(next, 0, 'uidaddByPlatform Fail');
                } else {
                    res.result.response(next, 1, 'uidaddByPlatform Success', user);
                };
            };
        } else {
            var x = userManager[app].ufindByPlatform({ platform: uplatform, userData: user });
            if (x == false) {
                var y = userManager[app].uaddByPlatform({ platform: uplatform, userData: user });
                if (y == false) {
                    res.result.response(next, 0, 'uaddByPlatform Fail', user);
                } else {
                    var z = userManager[app].uaddToken({ _id: y._id, platform: uplatform, userData: token });
                    if (z == false) {
                        res.result.response(next, 0, 'UaddToken Fail');
                    } else {
                        req.session[app] = { _id: y._id, ulogin: 1, app: app };
                        res.result.response(next, 1, 'UaddToken & uaddByPlatform Success', user);
                    };
                };
            } else {
                req.session[app] = { _id: x._id, name: x.name, picture: x.picture, ulogin: 1, app: app };
                res.result.response(next, 1, 'ufindByPlatform Success', user);
            };
        };
    } else {
        res.write("params:");
        res.write(JSON.stringify(req.params));
        res.write("body:");
        res.write(JSON.stringify(req.query));
        res.end();
    }
}
, data = function (req, res, next) {
    var userData = req.session || {};
    userData.ip = req.connection.remoteAddress;
    res.send(userData);
}
, checkAPP = function (app) {
    if (!easyDB[app]) {
        easyDB[app] = new EasyDB(userConfig);
        easyDB[app].DB.connect({ "url": userConfig.option.url + app }, function () { });

        userManager[app] = new UserManager(easyDB[app], config.get('Mail'));
        logger.info.info('initial userManager: ' + app);

        logger.info.info('initial easyDB: ' + easyDB[app].listTable());
    }
    return true;
}
	//master
, login = function (req, res, next) {
    res.result = new Result();
    var data = req.body;
    var app = 'simple';

    var x = userManager[app].login(data);
    var s = req.session;
    if (x == false) {
        res.result.response(next, 0, 'Login Fail');
    } else {
        !req.session[app] && (req.session[app] = {});
        req.session[app] = { _id: x._id, name: x.name, picture: x.picture, login: 1, app: app };
        req.session.APP = app;
        res.result.response(next, 1, 'Login Success', x);
    };
}
, logout = function (req, res, next) {
    res.result = new Result();
    req.session.destroy();
    res.result.response(next, 1, 'Session Destroy');
}
, addtoken = function (req, res, next) {
    res.result = new Result();
    var data = req.body;
    var x = userManager['simple'].addToken(data);
    if (x == false) {
        res.result.response(next, 0, 'Addtoken Fail');
    } else {
        res.result.response(next, 1, 'Addtoken Success', x);
    };
}
, regist = function (req, res, next) {
    res.result = new Result();
    var data = req.body;
    var app = 'simple';
    var x = userManager[app].add(data);
    !req.session[app] && (req.session[app] = {});
    req.session[app] = { _id: x._id, name: x.name, picture: x.picture, login: 1, app: app };
    req.session.APP = app;

    if (x == false) {
        res.result.response(next, 0, 'Regist Fail');
    } else {
        res.result.response(next, 1, 'Regist Success', x);
    };
}
, check = function (req, res, next) {
    res.result = new Result();
    var s = req.session;
    if (s && s.name != null && s.login == 1) {
        res.result.response(next, 1, 'Check Success', s);
    } else {
        res.result.response(next, -2, 'Check Fail');
    };
}
, forgot = function (req, res, next) {
    res.result = new Result();
    var data = req.body;
    var x = userManager['simple'].forgot(data);
    if (x == false) {
        res.result.response(next, 0, 'Forgot Fail');
    } else {
        res.result.response(next, 1, 'Forgot Success', x);
    };
}
, repassword = function (req, res, next) {
    res.result = new Result();
    var data = req.body;
    var x = userManager['simple'].repassword(data);
    if (x == false) {
        res.result.response(next, 0, 'Repassword Fail');
    } else {
        res.result.response(next, 1, 'Repassword Success', x);
    };
}
	//user
    // app data = > req.params.app
, ulogin = function (req, res, next) {
    res.result = new Result();

    var app = req.params.app;
    checkAPP(app);

    var data = req.body;
    var x = userManager[app].ulogin(data);
    if (x == false) {
        res.result.response(next, 0, 'Login Fail');
    } else {

        !req.session[app] && (req.session[app] = {});
        req.session[app] = { _id: x._id, name: x.name, picture: x.picture, ulogin: 1, app: app };
        req.session.APP = app;
        res.result.response(next, 1, 'Login Success', x);
    };
}
, ulogout = function (req, res, next) {

    var app = req.params.app;
    checkAPP(app);

    res.result = new Result();
    req.session.destroy();
    res.result.response(next, 1, 'Session Destroy');
}
, uaddtoken = function (req, res, next) {
    res.result = new Result();

    var app = req.params.app;
    checkAPP(app);

    var data = req.body;
    var x = userManager[app].addToken(data);
    if (x == false) {
        res.result.response(next, 0, 'Addtoken Fail');
    } else {
        res.result.response(next, 1, 'Addtoken Success', x);
    };
}
, uregist = function (req, res, next) {
    res.result = new Result();

    var app = req.params.app;
    checkAPP(app);
    logger.info.info(app)

    var data = req.body;
    var x = userManager[app].uadd(data);
    if (x == false) {
        res.result.response(next, 0, 'Regist Fail');
    } else {

        !req.session[app] && (req.session[app] = {});
        req.session[app] = { _id: x._id, name: x.name, picture: x.picture, ulogin: 1, app: app };
        req.session.APP = app;

        logger.info.info(app)
        logger.info.info(req.session[app])

        res.result.response(next, 1, 'Regist Success', x);
    };
}
, ucheck = function (req, res, next) {
    res.result = new Result();
    var app = req.params.app;
    var s = req.session[app];

    if (s && s.ulogin == 1) {
        res.result.response(next, 1, 'Check Success', s);
    } else {
        res.result.response(next, -2, 'Check Fail');
    };
}
, uforgot = function (req, res, next) {
    res.result = new Result();

    var app = req.params.app;
    checkAPP(app);

    var data = req.body;
    var x = userManager[app].uforgot(data);
    if (x == false) {
        res.result.response(next, 0, 'Forgot Fail');
    } else {
        res.result.response(next, 1, 'Forgot Success', x);
    };
}
, urepassword = function (req, res, next) {
    res.result = new Result();

    var app = req.params.app;
    checkAPP(app);

    var data = req.body;
    var x = userManager.urepassword(data);
    if (x == false) {
        res.result.response(next, 0, 'Repassword Fail');
    } else {
        res.result.response(next, 1, 'Repassword Success', x);
    };
}
, outerLogin = function (req, res, next) {
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
;

module.exports = {
    init: function (_config, _logger, route) {
        config = _config;
        logger = _logger;
        userConfig = config.get('userConfig');
        //console.log(userConfig);
        //checkAPP('simple');

        easyDB['simple'] = new EasyDB(userConfig);
        easyDB['simple'].connect(userConfig.option);
        userManager['simple'] = new UserManager(easyDB['simple'], config.get('Mail'));

        var serverConfig = _config.get('server') || {};

        for (var key in AuthModule) {
            var moduleName = key.toLowerCase();
            var moduleConfig = config.get(moduleName) || {};
            moduleConfig.callbackURL = serverConfig.url + "auth/" + moduleName + "/return";
            passport[moduleName] = new AuthModule[key](moduleConfig);
        }

        //user data
        route.get('/me', data);

        //master
        route.post('/login', login);
        route.get('/logout', logout);
        route.get('/addtoken', addtoken);
        route.post('/regist', regist);
        route.get('/check', check);
        route.post('/forgot', forgot);
        route.post('/repassword', repassword);

        //user
        route.post('/API/:app/ulogin', ulogin);
        route.get('/API/:app/ulogout', ulogout);
        route.get('/API/:app/uaddtoken', uaddtoken);
        route.post('/API/:app/uregist', uregist);
        route.get('/API/:app/ucheck', ucheck);
        route.post('/API/:app/uforgot', uforgot);
        route.post('/API/:app/urepassword', urepassword);

        route.get('/oauth/:platform', auth);
        route.get('/:app/oauth/:platform', auth);
        route.get('/APP/:app/oauth/:platform', auth);
        route.get('/oauth/:platform/return', authReturn);
    },
    file: function (req, res, next) {
        res.result = new Result();
        var filename = req.params[0];

        res.result.response(next, 3, '', {
            "path": passport.google.getPublic(filename)
        });
    }
};