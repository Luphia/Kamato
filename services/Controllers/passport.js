var config
, logger
, passport = {}
, easyDB
, userManager
;

var Result = require('../Classes/Result.js')
, AuthModule = require('../Passport')
, UserManager = require('../Classes/UserManager.js')
, EasyDB = require('../Classes/EasyDB.js')
;

var auth = function (req, res, next) {
    res.result = new Result();
    var platform = req.params.platform;
    console.log(platform)

    res.result.response(next, 3, '', {
        "path": passport[platform].getAuthLink()
    });
}
, authReturn = function (req, res, next) {
    res.result = new Result();
    var platform = passport[req.params.platform];
    var data = req.query;
    var db = easyDB;
    //check session login status

    if (platform) {

        var s = req.session;
        console.log('123')

        var token = platform.getToken(data);
        var user = platform.getProfile(token);
        res.result.response(next, 1, 'login successful', user);
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
	//master
, login = function (req, res, next) {
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
}
, loginout = function (req, res, next) {
    res.result = new Result();
    req.session.destroy();
    res.result.response(next, 1, 'Session Destroy');
}
, addtoken = function (req, res, next) {
    res.result = new Result();
    var data = req.body;
    var x = userManager.addToken(data);
    if (x == false) {
        res.result.response(next, 0, 'Addtoken Fail');
    } else {
        res.result.response(next, 1, 'Addtoken Success', x);
    };
}
, regist = function (req, res, next) {
    res.result = new Result();
    var data = req.body;
    var x = userManager.add(data);
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
    var x = userManager.forgot(data);
    if (x == false) {
        res.result.response(next, 0, 'Forgot Fail');
    } else {
        res.result.response(next, 1, 'Forgot Success', x);
    };
}
, repassword = function (req, res, next) {
    res.result = new Result();
    var data = req.body;
    var x = userManager.repassword(data);
    if (x == false) {
        res.result.response(next, 0, 'Repassword Fail');
    } else {
        res.result.response(next, 1, 'Repassword Success', x);
    };
}
	//user
, ulogin = function (req, res, next) {
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
        s.ulogin = 1;
        res.result.response(next, 1, 'Login Success', x);
    };
}
, uloginout = function (req, res, next) {
    res.result = new Result();
    req.session.destroy();
    res.result.response(next, 1, 'Session Destroy');
}
, uaddtoken = function (req, res, next) {
    res.result = new Result();
    var data = req.body;
    var x = userManager.addToken(data);
    if (x == false) {
        res.result.response(next, 0, 'Addtoken Fail');
    } else {
        res.result.response(next, 1, 'Addtoken Success', x);
    };
}
, uregist = function (req, res, next) {
    res.result = new Result();
    var data = req.body;
    var x = userManager.uadd(data);
    if (x == false) {
        res.result.response(next, 0, 'Regist Fail');
    } else {
        res.result.response(next, 1, 'Regist Success', x);
    };
}
, ucheck = function (req, res, next) {
    res.result = new Result();
    var s = req.session;
    if (s && s.name != null && s.login == 1) {
        res.result.response(next, 1, 'Check Success', s);
    } else {
        res.result.response(next, -2, 'Check Fail');
    };
}
, uforgot = function (req, res, next) {
    res.result = new Result();
    var data = req.body;
    var x = userManager.uforgot(data);
    if (x == false) {
        res.result.response(next, 0, 'Forgot Fail');
    } else {
        res.result.response(next, 1, 'Forgot Success', x);
    };
}
, urepassword = function (req, res, next) {
    res.result = new Result();
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
        easyDB = new EasyDB(userConfig);
        easyDB.connect(userConfig.option);
        userManager = new UserManager(easyDB, config.get('Mail'));

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
        route.get('/loginout', loginout);
        route.get('/addtoken', addtoken);
        route.post('/regist', regist);
        route.get('/check', check);
        route.post('/forgot', forgot);
        route.post('/repassword', repassword);

        //user
        route.post('/ulogin', ulogin);
        route.get('/uloginout', uloginout);
        route.get('/uaddtoken', uaddtoken);
        route.post('/uregist', uregist);
        route.get('/ucheck', ucheck);
        route.post('/uforgot', uforgot);
        route.post('/urepassword', urepassword);

        route.get('/oauth/:platform', auth);
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