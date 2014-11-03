/*
	===== test method =====
	cd ~/Kamato
	node

	var oauth = new require('./services/Objects/fitbitPassport.js')();
	oauth.getAuthLink();

	var token = oauth.getToken();
	var token = oauth.getToken({"code":"4/BG54rvX2TSCDDhsJl5GIEMluRbqjzB2_ylOPAP3niQc.ogr4w6u9lz4RBrG_bnfDxpL-Gba_kgI","authuser":"0","num_sessions":"1","prompt":"consent","session_state":"c3d1549d8cdb650544cc3078eb489e86ad223aca..1399"});

	oauth.getProfile(token);
	oauth.getFriends(token);
	oauth.getActivities(token);
	oauth.getNutrition(token);
	oauth.getSleep(token);
	oauth.getPhysiological(token);
	
	oauth.runStepD(token);
 */

var url = require('url'),
	Rest = require('node-rest-client'),
	request = require('request'),
	crypto = require('crypto');

var createSignature = function(method, path, clientSecretKey, options) {
	var rs = [],
		baseString;

	for(var k in options) {
		rs.push(k + '%3D' + encodeURIComponent(options[k]));
	}
	baseString = method + "&" + encodeURIComponent(path) + "&" + rs.join("%26");

	var key = clientSecretKey + "&";
	var signature = crypto.createHmac('sha1', key).update(new Buffer(baseString)).digest('base64');

	return encodeURIComponent(signature);
};

var createHeader = function(options) {
	/*
	{
		method,
		path,
		oauth_consumer_key
		clientSecretKey
	}
	*/

	options.oauth_signature_method = "HMAC-SHA1";
	options.oauth_timestamp = Math.round(new Date()/1000);
	options.oauth_nonce="";
	options.version = "1.0";

	var signatureOptions = {
		"oauth_callbackaaa": options.oauth_callback,
		"oauth_consumer_key": options.oauth_consumer_key,
		"oauth_nonce": options.oauth_nonce,
		"oauth_signature_method": options.oauth_signature_method,
		"oauth_timestamp": options.oauth_timestamp,
		"oauth_version": options.version
	};

	var signature = createSignature(options.method, options.path, options.clientSecretKey, signatureOptions);
	var authHeaders = [];
	signatureOptions.oauth_signature = signature;

	for(var k in signatureOptions) {
		authHeaders.push(k + '="' + signatureOptions[k] + '"');
	}
	var headers = {};
	headers.Authorization = "OAuth " + authHeaders.join(", ");

	return headers;
};

var parseQuery = function(data) {
	var tmp = [];
	if(typeof data != 'object') { data = {}; }
	for(var k in data) {
		tmp.push( k + "=" + encodeURIComponent(data[k]) );
	}
	return tmp.join("&");
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
		var rs;
		var link = this.config.url.preAuth;
		var headerOptions = {
			"method": "POST",
			"path": link,
			"oauth_consumer_key": this.config.oauthConsumerKey,
			"clientSecretKey": this.config.clientSecretKey,
			"oauth_callback": this.config.oauth_callback
		};
		
		var options = {
			"url": link,
			"headers": createHeader(headerOptions)
		};

		request.post(options, function(err, response, body) {
			rs = body;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return this.config.url.authPath + "?" + rs;
	};

	// 取得授權 token
	var getToken = function() {
		var rs;
		
		var strAuthLink = oauth.getAuthLink();
		var oauthToken = strAuthLink.split("&")[0].split("?")[1];
		rs = oauthToken.split("=")[1];

		/*
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
		*/

		return rs;
	};

	// 更新授權 token
	var renewToken = function(token) {

	};

	// 取得用戶資訊
	var getProfile = function(token) {
		var link = this.config.url.authClientAccessPath;
		//var rs = link + "?oauth_token="+token;
		
		var rs,
			options = {
				//"url": link,
				//"oauth_token": getToken
				url: link,
				form: {"oauth_token": oauth.getToken()}
			};

		request.post(options, function(err, response, body) {
			if (!err && response.statusCode == 200) {
				console.log("cccc-->"+body);
				rs = JSON.parse(body);
				//rs = body;
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
	
	

	//------------------------
	// The user approves the client application, and Fitbit redirects the user to the client application site.
	// (OAuth Flow Diagram D)
	// 有個 "allow" 的按鈕, 按了後會出現 PIN 的值, 這個值=標頭oauth_verifier
	//
	//https://www.fitbit.com/oauth?oauth_token=3f5c2ff48750958c1ed5c0f32f7d5d8e&locale=&display=&authentication=true&oauth_allow=Allow&_sourcePage=1sgB_uCtaILGrJMFkFsv6XbX0f6OV1Ndj1zeGcz7OKyqzpfBpGzBwTKIuNMgn5lyAHyJYxmkph5-a1BbgHUGtZFWlNDZdgrsngKh9Hbi9yU%3D&__fp=fZPyd5A7S7A%3D
	//https://www.fitbit.com/oauth?oauth_token=3f5c2ff48750958c1ed5c0f32f7d5d8e&locale=&display=&authentication=true&oauth_allow=Allow

	var runStepD = function(token) {
		var rs;
		var link = this.config.url.allowPath;
		
		link = link.replace("{replaceOauthToken}", token);
		console.log("link:\n"+link);
		console.log();
		
		var postData;
		var options = {
			"url": link,
			"form": postData
		};

		request.post(options, function(err, response, body) {
			//rs = JSON.parse(body);
			//rs = response.getHeader("oauth_verifier");
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}
		console.log("rs:\n"+rs);
		return rs;
	};

	
	var runStepD01 = function(token) {
		return "abc111222-"+token;
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
		"runStepD": runStepD,
		//"runStepD01": runStepD01,
		"getPhysiological": getPhysiological
	};
	return passport.init(_type, _config);
	
};





//------------------------
// The client requests and receives token credentials from Fitbit.
// (OAuth Flow Diagram E and F)
//
var createHeaderStepEF = function(options) {
	/*
	{
		method,
		path,
		oauth_consumer_key
		clientSecretKey
	}
	*/
	
	
	options.oauth_nonce = "";
	options.oauth_signature_method = "HMAC-SHA1";
	options.oauth_verifier = "";
	options.oauth_timestamp = Math.round(new Date()/1000);
	options.version = "1.0";

	var signatureOptions = {
		"oauth_consumer_key": options.oauth_consumer_key,
		"oauth_token": oauth.getProfile(token),
		"oauth_nonce": options.oauth_nonce,
		"oauth_verifier": options.oauth_verifier,
		"oauth_signature_method": options.oauth_signature_method,
		"oauth_timestamp": options.oauth_timestamp,
		"oauth_version": options.version
	};

	var signature = createSignature(options.method, options.path, options.clientSecretKey, signatureOptions);
	var authHeaders = [];
	signatureOptions.oauth_signature = signature;

	for(var k in signatureOptions) {
		authHeaders.push(k + '="' + signatureOptions[k] + '"');
	}
	var headers = {};
	headers.Authorization = "OAuth " + authHeaders.join(", ");

	return headers;
};
