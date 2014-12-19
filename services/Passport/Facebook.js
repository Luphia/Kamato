/*
	===== test method =====
	cd ~/Kamato
	node

	var oauth = new require('./services/Passport/Passport.facebook.js')();
	oauth.getAuthLink();

	var token = oauth.getToken();

	oauth.getProfile(token);
	oauth.getFriends(token);
	oauth.getActivities(token);
	oauth.getNutrition(token);
	oauth.getSleep(token);
	oauth.getPhysiological(token);
 */


var url = require('url'),
	Rest = require('node-rest-client'),
	request = require('request');
var https = require('https');
var parseQuery = function (data) {
    var tmp = [];
    if (typeof data != 'object') { data = {}; }
    for (var k in data) {
        tmp.push(k + "=" + encodeURIComponent(data[k]));
    }
    return tmp.join("&");
};

module.exports = function (_config) {
    var init = function (config) {

        if (_config) {
            this.config = config;
        }
        else {
            this.config = testconfig;
        }

        return this;
    };

    // 取得認證連結網址
    var getAuthLink = function () {
        var link = this.config.url.authPath;
        /*
		var params = {
			"response_type": this.config.response_type,
			"redirect_uri": this.config.redirect_uri,
			"scope": this.config.scope,
			"client_id": this.config.client_id
		};
		*/
        var params = {
            "type": "client_cred",
            "redirect_uri": this.config.redirect_uri,
            "client_id": this.config.client_id,
            "scope": this.config.scope,
            "response_type": this.config.response_type

        };

        return link + "?" + parseQuery(params);
    };

    // 取得授權 token
    var getToken = function (data) {
        var rs;

        // Set the headers
        var headers = {
            'User-Agent': 'Super Agent/0.0.1',
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        // Configure the request
        var options = {
            url: 'https://graph.facebook.com/oauth/access_token?',
            method: 'GET',
            headers: headers,
            qs: { 'client_id': this.config.client_id, 'redirect_uri': this.config.redirect_uri, 'client_secret': this.config.client_secret, 'code': data.code }
        }

        // Start the request
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                rs = body.split('access_token=')[1];
            }
            else if (response.statusCode > 200) {
                rs = false;
            };
        })

        while (rs === undefined) {
            require('deasync').runLoopOnce();
        }

        return rs;
    };

    // 更新授權 token
    var renewToken = function (token) {

    };

    // 取得用戶資訊
    var getProfile = function (token) {
        if (!this.config.url.getProfile) { return false; }

        var rs,
			params = "access_token=" + token,
			options = {
			    "url": this.config.url.getProfile + "?" + params
			};

        request(options, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                rs = JSON.parse(body);
            }
            else if (response.statusCode > 200) {
                rs = false;
            }
        });

        while (rs === undefined) {
            require('deasync').runLoopOnce();
        }

        return rs;
    };

    // 取得用戶好友清單
    var getFriends = function (token) {
        if (!this.config.url.getFriends) { return false; }
    };

    // 取得用戶活動紀錄
    var getActivities = function (token) {
        if (!this.config.url.getActivities) { return false; }
    };

    // 取得用戶飲食記錄
    var getNutrition = function (token) {
        if (!this.config.url.getNutrition) { return false; }
    };

    // 取得用戶睡眠資訊
    var getSleep = function (token) {
        if (!this.config.url.getSleep) { return false; }
    };

    // 取得用戶生理資訊
    var getPhysiological = function (token) {
        if (!this.config.url.getPhysiological) { return false; }
    };

    var passport = {
        "init": init,
        "getAuthLink": getAuthLink,
        "getToken": getToken,
        "renewToken": renewToken,
        "getProfile": getProfile,
        "getFriends": getFriends,
        "getActivities": getActivities,
        "getNutrition": getNutrition,
        "getSleep": getSleep,
        "getPhysiological": getPhysiological
    };
    return passport.init(_config);
};


