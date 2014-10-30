/*
	===== test method =====
	cd ~/Kamato
	node

	var oauth = new require('./services/Objects/Passport.js')();
	oauth.getAuthLink();

	var token = oauth.getToken({"code":"4/agfqHCbgBTFAWWvW7Rgj6zRjVsX_lbseaIhWRBlxwcc.4jZGqNanlTcUgrKXntQAax1O9SK_kgI","authuser":"0","num_sessions":"1","prompt":"consent","session_state":"2dbec5095820e81e3ae0e4cf01c599e4128e6d6b..3e50"});

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

var parseQuery = function(data) {
	var tmp = [];
	if(typeof data != 'object') { data = {}; }
	for(var k in data) {
		tmp.push( k + "=" + encodeURIComponent(data[k]) );
	}
	return tmp.join("&");
};
var testconfig = {
	"response_type": "code",
	"redirect_uri": "https://simple.tanpopo.cc/auth/google/return",
	"scope": "https://www.googleapis.com/auth/plus.login",
	"client_id": "964145913352-d8i2c39q3bfkhrhe494i9imk0tnf9jsi.apps.googleusercontent.com",
	"client_secret": "_tD4b3CLLh04UiPQJF_2SQI9",
	"grant_type": "authorization_code",
	"url": {
		"authPath": "https://accounts.google.com/o/oauth2/auth",
		"getToken": "https://accounts.google.com/o/oauth2/token",
		"getProfile": "https://www.googleapis.com/userinfo/v2/me",
		"getFriends": false,
		"getActivities": false,
		"getSleep": false,
		"getPhysiological": false,
		"getNutrition": false
	}
};

module.exports = function(_type, _config) {
	var init = function(type, config) {
		this.type = type;
		if(_config) {
			this.config = config;
		}
		else {
			this.config = testconfig;
		}

		return this;
	};

	// 取得認證連結網址
	var getAuthLink = function() {
		var link = this.config.url.authPath;
		var params = {
			"response_type": this.config.response_type,
			"redirect_uri": this.config.redirect_uri,
			"scope": this.config.scope,
			"client_id": this.config.client_id
		};
		return link + "?" + parseQuery(params);
	};

	// 取得授權 token
	var getToken = function(data) {
		var rs;

		postData = { "code": data.code };
		postData.redirect_uri = this.config.redirect_uri;
		postData.client_id = this.config.client_id;
		postData.scope = this.config.scope;
		postData.client_secret = this.config.client_secret;
		postData.grant_type = this.config.grant_type;

		var options = {
			"url": this.config.url.getToken,
			"form": postData
		};

		request.post(options, function(err, response, body) {
			rs = JSON.parse(body);
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	};

	// 更新授權 token
	var renewToken = function(token) {

	};

	// 取得用戶資訊
	var getProfile = function(token) {
		if(!this.config.url.getProfile) { return false; }

		var rs,
			headers = {
				"Authorization": token.token_type + " " + token.access_token
			},
			options = {
				"url": this.config.url.getProfile,
				"headers": headers
			};

		request(options, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				rs = JSON.parse(body);
			}
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	};

	// 取得用戶好友清單
	var getFriends = function(token) {
		if(!this.config.url.getFriends) { return false; }
	};

	// 取得用戶活動紀錄
	var getActivities = function(token) {
		if(!this.config.url.getActivities) { return false; }
	};

	// 取得用戶飲食記錄
	var getNutrition = function(token) {
		if(!this.config.url.getNutrition) { return false; }
	};

	// 取得用戶睡眠資訊
	var getSleep = function(token) {
		if(!this.config.url.getSleep) { return false; }
	};

	// 取得用戶生理資訊
	var getPhysiological = function(token) {
		if(!this.config.url.getPhysiological) { return false; }
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
	return passport.init(_type, _config);
};


