/*
	===== test method =====
	cd ~/Kamato
	node

	var deviceJson = require('./config.private/jawbone.json');
	var oauth = new require('./services/Passport/Jawbone.js')(deviceJson);
	oauth.getAuthLink();

	var token = oauth.getToken({"code":"W3AjaI7_iOV5d9yyEQhHckLsustPIqURZcydp94F-AzbYPZq2li5cjDuWmnec0mgNDtv3sbXTWQBJ9ZshZjnXGnsJP0LaG7m9eAlsF4YQ0Gpsod0ctBiYrcEWeky2T-__WIduvNTO8rTCxGULsWO8Uu-9BxDohRVEk8-KWMwV7BRgiwMc06L-ypEIwFltv7s1el8M-Bg2Nrk8lNHm2EhXf13coH8-zAh"});
	var user = oauth.getUser(token);
	var profile = oauth.getProfile(token);
	var goals = oauth.getGoals(token);
	var activities = oauth.getActivities(token);

	var friends = oauth.getFriends(token);
	var nutrition = oauth.getNutrition(token);
	var sleep = oauth.getSleep(token);

	var physiological = oauth.getPhysiological(token);
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
		//console.log(link + "?" + parseQuery(params));
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

	/**
	 * 更新授權 token
	 * param {refreshToken} 原refresh token
	 * return [json] access_token, refresh_token...等
	 */
	var renewToken = function(refreshToken) {
		var rs, postData = {};

		postData.client_id = this.config.client_id;
		//postData.scope = this.config.scope;
		postData.client_secret = this.config.client_secret;
		postData.grant_type = "refresh_token";
		postData.refresh_token = refreshToken;

		var headers = {
			'Content-Type': "application/x-www-form-urlencoded"
		};
		var options = {
			"url": this.config.url.getToken,
			"headers": headers,
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

	// 取得User資訊
	var getUser = function(token) {
		if(!this.config.url.getUser) { return false; }
		var rs = this.getAnyData(token, this.config.accept, this.config.url.getUser);
		return rs;
	};
	
	// 取得用戶資訊
	var getProfile = function(token) {
		if(!this.config.url.getProfile) { return false; }
		var rs = this.getAnyData(token, this.config.accept, this.config.url.getProfile);
		return rs;
	};
	
	// 取得Goals資訊
	var getGoals = function(token) {
		if(!this.config.url.getGoals) { return false; }
		var rs = this.getAnyData(token, this.config.accept, this.config.url.getGoals);
		return rs;
	};

	// 取得用戶好友清單
	var getFriends = function(token) {
		if(!this.config.url.getFriends) { return false; }
		var rs = this.getAnyData(token, this.config.accept, this.config.url.getFriends);
		return rs;
	};

	// 取得用戶活動紀錄
	var getActivities = function(token) {
		if(!this.config.url.getActivities) { return false; }
		//var strStartDate = new Date()/1000;
		var strStartDate = new Date("03-18-2014").getTime();
		var startDate = Math.round(strStartDate);
		var rs = this.getAnyData(token, this.config.accept, this.config.url.getActivities);
		return rs;
	};

	// 取得用戶飲食記錄
	var getNutrition = function(token) {
		if(!this.config.url.getNutrition) { return false; }
		var rs = this.getAnyData(token, this.config.accept, this.config.url.getNutrition);
		return rs;
	};

	// 取得用戶睡眠資訊
	var getSleep = function(token) {
		if(!this.config.url.getSleep) { return false; }
		var rs = this.getAnyData(token, this.config.accept, this.config.url.getSleep);
		return rs;
	};

	// 取得用戶生理資訊
	var getPhysiological = function(token) {
		if(!this.config.url.getPhysiological) { return false; }
		var rs = this.getAnyData(token, this.config.accept, this.config.url.getPhysiological);
		return rs;
	};
	
	/**
	 * 取得資訊
	 * param token: (String) access token
	 * param varAccept: (String) header中 accept 的定義
	 * param varUrl: (String) 進行GET的 uri
	 */
	var getAnyData = function(token, varAccept, varUrl) {
		var rs,
			headers = {
				'Accept': varAccept,
				"Authorization": token.token_type + " " + token.access_token
			},
			options = {
				"url": varUrl,
				"headers": headers
			};

		request(options, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				rs = JSON.parse(body);
			} else {
				rs = false;
			}
			if(err) {
				console.log(err);
				rs = false;
			}
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	};

	var passport = {
		"init": init,
		"getAuthLink": getAuthLink,
		"getToken": getToken,
		"renewToken": renewToken,
		"getUser": getUser,
		"getProfile": getProfile,
		"getGoals": getGoals,
		"getFriends": getFriends,
		"getActivities": getActivities,
		"getNutrition": getNutrition,
		"getSleep": getSleep,
		"getPhysiological": getPhysiological,
		"getAnyData": getAnyData
	};
	return passport.init(_config);
};