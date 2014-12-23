/*
	===== test method =====
	cd ~/Kamato
	node

var deviceJson = require('./config.private/fitbit.json');
var oauth = new require('./services/Passport/Fitbit.js')(deviceJson);

var x = oauth.getAuthLink();
	// 於瀏覽器, 瀏覽oauth.getAuthLink();回傳的網址，取得body的json，copy貼。
	
	var token = oauth.getToken({"oauth_token":"67986ff0d3769b3acd08eae0b743df2a","oauth_verifier":"gu6odsb7gvh300frmdl6319bcm"}, x);

	// 取各個想要的資料
	var sleepJson = oauth.getSleep(token, "2014-11-21");
	var profile = oauth.getProfile(token);
	var activities = oauth.getActivities(token, "2014-11-21");
	var nutrition = oauth.getNutrition(token, "2014-11-21");
	var friends = oauth.getFriends(token);
	
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
var createSignature = function(method, path, clientSecretKey, options, signatureMode, temporaryOauthData, token) {
	var rs = [],
		baseString;
	
	var key;
	switch(signatureMode) {
		case "mode_EF":
			 key = clientSecretKey + "&" + temporaryOauthData.oauth_token_secret;
			 break;

		//步驟G, 重設oauth_signature.
		case "mode_G":
			 key = clientSecretKey + "&" + token.oauth_token_secret;
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
		accessApiOauthData = token;
		return accessApiOauthData;
	};

	// 取得用戶資訊
	// 參考網址: https://wiki.fitbit.com/display/API/API-Get-User-Info
	var getProfile = function(token) {
		if(!this.config.url.getProfile) { return false; }
		var rs = this.getAnyData("getProfile", "/profile", token);
		return rs;
	};

	// 取得用戶好友清單
	// 參考網址: https://wiki.fitbit.com/display/API/API-Get-Friends
	var getFriends = function(token) {
		if(!this.config.url.getFriends) { return false; }
		var rs = this.getAnyData("getFriends", "/friends", token);
		return rs;
	};

	// 取得用戶活動紀錄
	// 參考網址: https://wiki.fitbit.com/display/API/API-Get-Activities
	// param date : 格式YYYY-mm-dd, 如:2010-02-25.
	var getActivities = function(token, date) {
		if(!this.config.url.getActivities) { return false; }
		var rs = this.getAnyData("getActivities", "/activities/date/", token, date);
		return rs;
	};

	// 取得用戶飲食記錄
	// 參考網址: https://wiki.fitbit.com/display/API/API-Get-Food-Logs
	// param date : 格式YYYY-mm-dd, 如:2010-02-25.
	var getNutrition = function(token, date) {
		if(!this.config.url.getNutrition) { return false; }
		var rs = this.getAnyData("getNutrition", "/foods/log/date/", token, date);
		return rs;
	};

	// 取得用戶睡眠資訊
	// 參考網址: https://wiki.fitbit.com/display/API/API-Get-Sleep
	// param date : 格式YYYY-mm-dd, 如:2010-02-25.
	var getSleep = function(token, date) {
		if(!this.config.url.getSleep) { return false; }
		var rs = this.getAnyData("getSleep", "/sleep/date/", token, date);
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
	// param strUri : (String) 欲取得的資料的uri，即組url用的中間字串。
	// param dataDate : 格式YYYY-mm-dd, 如:2010-02-25.
	var getAnyData = function(debugName, strUri, combindToken, dataDate) {
		var rs,
		token = combindToken.token,
		oauthData = combindToken.oauthData;

		var link = this.config.url.apiPath + "/" + this.config.apiVersion + "/user/" + token.encoded_user_id + strUri + (dataDate? dataDate: '') + this.config.resFormat;
		//console.log("[debug] "+debugName+" link:\n"+link);

		var headerOptions = {
			"method": "GET",
			"path": link,
			"oauth_consumer_key": this.config.oauthConsumerKey,
			"clientSecretKey": this.config.clientSecretKey
		};

		var options = {
			"url": link,
			"headers": createHeaderStepEFG(headerOptions, "stepG", false, oauthData, token)
		};

		request(options, function(err, response, body) {
			rs = {};
			try {
				rs = JSON.parse(body);
			} catch(exp) {
				//console.log(body);
				//console.log(exp);
			}
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

		var json = {"url": link, "data": temporaryOauthData};
		return json;
	};
	
	

	var getToken = function(data, predata) {
		var oauthData = this.getOauthDataObj(data);
		var token = this.getAccessToken(predata.data, oauthData);
		var combindToken = {"token": token, "oauthData": oauthData};
		return combindToken;
	};

	// {執行步驟 E-F}
	// 有了暫時token後, 之後再以此產生真實token(E-F)
	// 取得存取Token及Secret
	// Get Fitbit User's permanent Access Token and Access Token Secret(E-F).
	var getAccessToken = function(temporaryOauthData, oauthData) {
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
			"headers": createHeaderStepEFG(headerOptions, "stepEF", temporaryOauthData, oauthData)
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
		"getToken": getToken,
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
var createHeaderStepEFG = function(options, step, temporaryOauthData, oauthData, token) {

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
		options.oauth_token = token.oauth_token;
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
	var signature = createSignature(options.method, options.path, options.clientSecretKey, signatureOptions, strMode, temporaryOauthData, token);
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
