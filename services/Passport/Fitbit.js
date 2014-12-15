/*
	===== test method =====
	cd ~/Kamato
	node

	var deviceJson = require('./config.private/fitbit.json');
	var oauth = new require('./services/Passport/Fitbit.js')(deviceJson);
	oauth.getPreAuthLink();
	var temporaryOauthData = oauth.getTemporaryTokenAndSecret();
	oauth.getAuthLink();
	// 於瀏覽器, 瀏覽oauth.getAuthLink();回傳的網址，取得body的json，copy貼。

	var oauthData = oauth.getOauthDataObj({"oauth_token":"8f9e9844838540ea47a7d14863e0b707","oauth_verifier":"8glg5g43orqd1kd0vjqqbuurpa"});
	var varAccessApiOauthData = oauth.getAccessToken();

	// 取各個想要的資料
	var sleepJson = oauth.getSleep("1", "2014-11-21", ".json");
	var profile = oauth.getProfile("1", ".json");
	var activities = oauth.getActivities("1", "2014-11-21", ".json");
	var nutrition = oauth.getNutrition("1", "2014-11-21", ".json");
	var friends = oauth.getFriends("1", ".json");
	
	oauth.getPhysiological(token);
 */

var url = require('url'),
	Rest = require('node-rest-client'),
	request = require('request'),
	crypto = require('crypto');
var accessApiOauthData;
/*
	options = {
		oauth_consumer_key
		oauth_nonce
		oauth_signature_method
		oauth_timestamp
		oauth_version
	}
 */
var createSignature = function(method, path, clientSecretKey, options, signatureMode) {
	var rs = [],
		baseString;
	
	var key;
	switch(signatureMode) {
		case "mode_EF":
			 key = clientSecretKey + "&" + temporaryOauthData.oauth_token_secret;
			 break;

		//步驟G, 重設oauth_signature.
		case "mode_G":
			 key = clientSecretKey + "&" + accessApiOauthData.oauth_token_secret;
			 options
			 break;
			 
		case "mode_AB":
		default:
			key = clientSecretKey + "&";
			break;
	}

	for(var k in options) {
		if(k == "oauth_signature") { continue; }
		rs.push(k + '%3D' + encodeURIComponent(options[k]));
	}
	baseString = method + "&" + encodeURIComponent(path) + "&" + rs.join("%26");

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
		"oauth_consumer_key": options.oauth_consumer_key,
		"oauth_nonce": options.oauth_nonce,
		"oauth_signature_method": options.oauth_signature_method,
		"oauth_timestamp": options.oauth_timestamp,
		"oauth_version": options.version
	};

	var signature = createSignature(options.method, options.path, options.clientSecretKey, signatureOptions, "mode_AB");
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
	var getPreAuthLink = function() {
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

	
	// 取得 Temporary token & secret
	// 由步驟A的執行結果取出 Temporary token & secret
	var getTemporaryTokenAndSecret = function() {
		var rs;

		var spltUrlAry = new Array();
		spltUrlAry = this.getPreAuthLink().split("?");
		var spltParamAry = new Array();
		spltParamAry = spltUrlAry[1].split("&");
		
		var kyValue = new Array();
		kyValue = {
			"oauth_token" : spltParamAry[0].split("=")[1],
			"oauth_token_secret" : spltParamAry[1].split("=")[1]
		};

		rs = kyValue;
		//console.log("Temporary kyValue: "+rs);
		
		return rs;
	};
	
	// 取得授權 token & verifier
	var getOauthDataObj = function(data) {
		var postData = { "oauth_token": data.oauth_token, "oauth_verifier": data.oauth_verifier };
		return postData;
	};

	// 更新授權 token
	var renewToken = function(token) {
		accessApiOauthData = token;			// 將token設定給全域變數accessApiOauthData，以利該支程式使用。
		return accessApiOauthData;
	};

	// 取得用戶資訊
	// 參考網址: https://wiki.fitbit.com/display/API/API-Get-User-Info
	// param apiVersion : (String) The API version. Currently 1.
	// param resFormat : (String)  輸出格式，有json和xml兩種。（如：.json或.xml）
	var getProfile = function(apiVersion, resFormat) {
		if(!this.config.url.getProfile) { return false; }
		var rs = this.getAnyData("getProfile", apiVersion, "", "/profile", resFormat);
		return rs;
	};

	// 取得用戶好友清單
	// 參考網址: https://wiki.fitbit.com/display/API/API-Get-Friends
	// param apiVersion : (String) The API version. Currently 1.
	// param resFormat : (String)  輸出格式，有json和xml兩種。（如：.json或.xml）
	var getFriends = function(apiVersion, resFormat) {
		if(!this.config.url.getFriends) { return false; }
		var rs = this.getAnyData("getFriends", apiVersion, "", "/friends", resFormat);
		return rs;
	};

	// 取得用戶活動紀錄
	// 參考網址: https://wiki.fitbit.com/display/API/API-Get-Activities
	// param apiVersion : The API version. Currently 1.
	// param date : 格式YYYY-mm-dd, 如:2010-02-25.
	// param resFormat : 輸出格式，有json和xml兩種。（如：.json或.xml）
	var getActivities = function(apiVersion, dataDate, resFormat) {
		if(!this.config.url.getActivities) { return false; }
		var rs = this.getAnyData("getActivities", apiVersion, "/activities/date/", dataDate, resFormat);
		return rs;
	};

	// 取得用戶飲食記錄
	// 參考網址: https://wiki.fitbit.com/display/API/API-Get-Food-Logs
	// param apiVersion : The API version. Currently 1.
	// param date : 格式YYYY-mm-dd, 如:2010-02-25.
	// param resFormat : 輸出格式，有json和xml兩種。（如：.json或.xml）
	var getNutrition = function(apiVersion, dataDate, resFormat) {
		if(!this.config.url.getNutrition) { return false; }
		var rs = this.getAnyData("getNutrition", apiVersion, "/foods/log/date/", dataDate, resFormat);
		return rs;
	};

	// 取得用戶睡眠資訊
	// 參考網址: https://wiki.fitbit.com/display/API/API-Get-Sleep
	// param apiVersion : The API version. Currently 1.
	// param date : 格式YYYY-mm-dd, 如:2010-02-25.
	// param resFormat : 輸出格式，有json和xml兩種。（如：.json或.xml）
	var getSleep = function(apiVersion, dataDate, resFormat) {
		if(!this.config.url.getSleep) { return false; }
		var rs = this.getAnyData("getSleep", apiVersion, "/sleep/date/", dataDate, resFormat);
		return rs;
	};

	// 取得用戶生理資訊
	var getPhysiological = function(token) {
		if(!this.config.url.getPhysiological) { return false; }
	};
	
	
	//------------------------------------------------------------------------------------------------
	// 取得資訊
	// 參考網址: https://wiki.fitbit.com/display/API/API-Get-Food-Logs
	// param debugName : (String) 除錯字之顯示文字
	// param apiVersion : (String) The API version. Currently 1.
	// param strUri : (String) 欲取得的資料的uri，即組url用的中間字串。
	// param dataDate : 格式YYYY-mm-dd, 如:2010-02-25.
	// param resFormat : (String)  輸出格式，有json和xml兩種。（如：.json或.xml）
	var getAnyData = function(debugName, apiVersion, strUri, dataDate, resFormat) {

		var rs;
		var acsApiOauthData = typeof(accessApiOauthData)=='object'?accessApiOauthData : this.getAccessToken();
		var link = this.config.url.apiPath + "/" + apiVersion + "/user/" + acsApiOauthData.encoded_user_id + strUri + dataDate + resFormat;
		//console.log("[debug] "+debugName+" link:\n"+link);

		var headerOptions = {
			"method": "GET",
			"path": link,
			"oauth_consumer_key": this.config.oauthConsumerKey,
			"clientSecretKey": this.config.clientSecretKey
		};

		var options = {
			"url": link,
			"headers": createHeaderStepEFG(headerOptions, "stepG")
		};

		request(options, function(err, response, body) {
			rs = JSON.parse(body);
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		return rs;
	};

	//------------------------------------------------------------------------------------------------
	// {執行步驟 D}
	// 組出 url
	var getAuthLink = function() {
		var temporaryOauthData = this.getTemporaryTokenAndSecret();
		var link = this.config.url.authClientAccessPath + "?oauth_token=" + temporaryOauthData.oauth_token;
		//console.log("stepD link:\n"+link);
		return link;
	};
	

	// {執行步驟 E-F}
	// 有了暫時token後, 之後再以此產生真實token(E-F)
	// 取得存取Token及Secret
	// Get Fitbit User's permanent Access Token and Access Token Secret(E-F).
	var getAccessToken = function() {
		var rs;
		var link = this.config.url.authorizeAccessAppPath;
		var headerOptions = {
			"method": "POST",
			"path": link,
			"oauth_consumer_key": this.config.oauthConsumerKey,
			"clientSecretKey": this.config.clientSecretKey,
		};

		var options = {
			"url": link,
			"headers": createHeaderStepEFG(headerOptions, "stepEF")
		};

		request.post(options, function(err, response, body) {
			rs = body;
		});

		while(rs === undefined) {
			require('deasync').runLoopOnce();
		}

		
		//console.log("Temporary kyValue: "+rs);
		//將值存成json
		var spltResultAry = new Array();
		spltResultAry = rs.split("&");

		var kyValue = new Array();
		kyValue = {
			"oauth_token" : spltResultAry[0].split("=")[1],
			"oauth_token_secret" : spltResultAry[1].split("=")[1],
			"encoded_user_id" : spltResultAry[2].split("=")[1],
		};

		rs = kyValue;
		return rs;
	};
	
	

	var passport = {
		"init": init,
		"getPreAuthLink": getPreAuthLink,
		"renewToken": renewToken,
		"getProfile": getProfile,
		"getFriends": getFriends,
		"getActivities": getActivities,
		"getNutrition": getNutrition,
		"getSleep": getSleep,
		"getPhysiological": getPhysiological,
		"getTemporaryTokenAndSecret": getTemporaryTokenAndSecret,
		"getAuthLink": getAuthLink,
		"getOauthDataObj": getOauthDataObj,
		"getAccessToken": getAccessToken,
		"getAnyData": getAnyData
	};
	return passport.init(_config);
	
};



//------------------------
// The client requests and receives token credentials from Fitbit.
// (OAuth Flow Diagram E and F)
//
// Using token credentials, the client makes calls to access Fitbit resources on behalf of the user.
// (OAuth Flow Diagram G)
/*
	options = {
		oauth_consumer_key,
		oauth_nonce,
		oauth_signature_method,
		oauth_timestamp,
		oauth_token,
		oauth_verifier,
		oauth_version
	}
*/
var createHeaderStepEFG = function(options, step) {

	options.oauth_nonce = "";
	options.oauth_signature_method = "HMAC-SHA1";
	options.oauth_timestamp = Math.round(new Date()/1000);
	options.version = "1.0";
	
	var strMode = "";
	if(step=="stepEF") {
		strMode = "mode_EF";
		options.oauth_verifier = oauthData.oauth_verifier;
		options.oauth_token = oauthData.oauth_token;
	} else if(step=="stepG") {
		strMode = "mode_G";
		options.oauth_token = accessApiOauthData.oauth_token;
	}


	
	var signatureOptions;
	if(step=="stepEF") {
		signatureOptions = {
			"oauth_consumer_key": options.oauth_consumer_key,
			"oauth_nonce": options.oauth_nonce,
			"oauth_signature_method": options.oauth_signature_method,
			"oauth_timestamp": options.oauth_timestamp,
			"oauth_token": options.oauth_token,
			"oauth_verifier": options.oauth_verifier,
			"oauth_version": options.version
		};
		
	} else if(step=="stepG") {
		signatureOptions = {
			"oauth_consumer_key": options.oauth_consumer_key,
			"oauth_nonce": options.oauth_nonce,
			"oauth_signature": false,
			"oauth_signature_method": options.oauth_signature_method,
			"oauth_timestamp": options.oauth_timestamp,
			"oauth_token": options.oauth_token,
			"oauth_version": options.version
		};
	}
//console.log("[debug] , 0001. ----------- signatureOptions:\n"+ JSON.stringify(signatureOptions));
//console.log("[debug] , 0001. ----------- options.clientSecretKey:\n"+ options.clientSecretKey);
	var signature = createSignature(options.method, options.path, options.clientSecretKey, signatureOptions, strMode);
//console.log("[debug] , 0002. -----------");
	var authHeaders = [];
	signatureOptions.oauth_signature = signature;
//console.log("[debug], 0009. signature:\n"+signature);

	for(var k in signatureOptions) {
		authHeaders.push(k + '="' + signatureOptions[k] + '"');
	}
	var headers = {};
	headers.Authorization = "OAuth " + authHeaders.join(", ");

	return headers;
};
