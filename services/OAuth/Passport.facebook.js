/*
	===== test method =====
	cd ~/Kamato
	node

	var oauth = new require('./services/Objects/Passport.js')();
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

var parseQuery = function(data) {
	var tmp = [];
	if(typeof data != 'object') { data = {}; }
	for(var k in data) {
		tmp.push( k + "=" + encodeURIComponent(data[k]) );
	}
	return tmp.join("&");
};

module.exports = function(_config) {
	var init = function(config) {

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
	return passport.init(_config);
};


