/**
Collector物件

依 user table 所有的人之各平台token，進行該user於xxx運動平台(如：Fitbit、jawbone、runkeeper)之取值的動作。
並將取得之值寫入各平台之table中，做為Kamato整合平台之用。


+----------+
| 使用方法 |
+----------+
	cd ~/Kamato
	node
	
var collector = new require('./services/Classes/Collector.js')();
var getAllTokenData = collector.getAllToken();
var insCollectAll = collector.collectAll(getAllTokenData);

*/

module.exports = function() {

	var init = function() {
		var edb = require('./EasyDB.js');
		this.db = new edb();
		this.db.connect({url: 'mongodb://10.10.23.31:27010/easyDB'});
		return this;
	};
	
	/**
	 * [查詢] 取得user table的資料
	 */
	var getUserTableData = function() {
		return this.db.listData("user");
	};
	
	var getTableData = function(table) {
		return this.db.listData(table);
	};

	/**
	 * [查詢] 取得user table中的list
	 * return data JSON資料格式
	 */
	var getAllToken = function() {
		var list = this.db.listData("user").list;
		return list;
	};
	
	/**
	 * [查詢] 依平台取得該平台的 Token
	 * param platform : (String)平台名稱
	 * return token(String)
	 */
	var getTokenByPlatform = function(platform) {
		var list = this.getAllToken();
		var rs = [];
		for(var i=0; i<list.length; i++) {
			switch(platform) {
				case "fitbit":
					rs.push(list[i][platform]["oauth_token"]);
					break;
				case "jawbone":
				case "runkeeper":
					rs.push(list[i][platform]["access_token"]);
					break;
				default:
					console.log("no select platform.");
			}
		}

		return rs;
	};
	
	/**
	 * 依據各平台取得該資料中的token
	 * jsonData : (json)各平台中的原始token之json資料。
	 * param platform : (String)平台名稱
	 * return token(String)
	 */
	var _getTokenByPlatform = function(platform, jsonData) {
		var rs;
		switch(platform) {
			case "fitbit":
				rs = jsonData["oauth_token"];
				break;
			case "jawbone":
			case "runkeeper":
				rs = jsonData["access_token"];
				break;
			default:
				console.log("no select platform.");
		}
		return rs;
	};
	
	/**
	 * 依據userId取得該平台下的token的json資料
	 */
	var _getTokenJsonObject = function(platform, userId) {
	console.log("userId:"+userId);
		var list = this.getAllToken();
		var rs;
		for(var i=0; i<list.length; i++) {
			if( list[i]["_id"]==userId ) {
				switch(platform) {
					case "fitbit":
						rs = {fitbit: list[i][platform]};
						break;
					case "jawbone":
						rs = {jawbone: list[i][platform]};
						break;
					case "runkeeper":
						rs = {runkeeper: list[i][platform]};
						break;
					default:
						console.log("no select platform.");
				}
			}
		}

		return rs;
	}
	
	/**
	 * [新增]
	 * 依據user table中的資料，寫入各個user之平台的運動資料。
	 */
	var collectAll = function() {
		console.log("--- collectAll postData Start ---");
		var userAllToken = this.getAllToken();
		for(var i=0; i<userAllToken.length; i++) {
			for(var listKey in userAllToken[i]) {
				var userId = userAllToken[i]["_id"];;
				//console.log(listKey + " : " + userAllToken[i][listKey]);
				if( listKey!="_id" ) {
					//console.log(listKey + "的json token="+JSON.stringify(userAllToken[i][listKey]));
					var token = this._getTokenByPlatform(listKey, userAllToken[i][listKey]);
					//console.log("token-->"+token);
					var tokenObj = this.setPlatformToken(listKey, token);

					var renewToken = {};
					if( JSON.stringify(tokenObj)!=undefined ) {
						console.log("----------[collectAll] ↓↓↓---------");
						var getJsonTokenData = this._getTokenJsonObject(listKey, userId);
						console.log("原token:\n"+JSON.stringify(getJsonTokenData));
						console.log("-------");
						renewToken = this.checkTokenAndToActive(listKey, getJsonTokenData, userId);		// 取得新的token

						console.log("----------[collectAll] ↑↑↑---------");

					}

					// 取出各平台token，並取得各動作之值，將其值寫入table。
					//console.log("dd=="+JSON.stringify(renewToken));
					this.collectData(listKey, renewToken[listKey], userId);		// 寫入資料
				}
			}
		}
		console.log("--- collectAll postData End ---");
	};
	
	/**
	 * 設定各平台之token，該格式用於Passport產出實際token用。
	 * param {platform} 平台名稱
	 * param {tokenObj} token字串
	 * return (Json Object)token
	 */
	var setPlatformToken = function(platform, tokenObj) {
		var tokenJson;
		// 依平台組出token json
		switch(platform) {
			case "fitbit":
				tokenJson = {"oauth_token": tokenObj["oauth_token"],"oauth_verifier": "8glg5g43orqd1kd0vjqqbuurpa"};
				break;
			case "jawbone":
			case "runkeeper":
				tokenJson = {"code": this._getTokenByPlatform(platform, tokenObj)};
				break;
		}
		return tokenJson;
	};
	
	/**
	 * 檢查該平台之token是否存活著，如不存在則重新取得token並更新table。
	 * param {platform} 平台名稱
	 * param {tokenObject} (Json Object)token
	 * param {userId} 使用者id (_id)
	 */
	var checkTokenAndToActive = function(platform, tokenObject, userId) {
		var deviceJson = require('../../config.private/'+platform+'.json');
		var library = '../Passport/' + platform + ".js";
		var passport = new require(library)(deviceJson);
		var bTokenAlive;

		switch(platform) {
			case "fitbit":
				bTokenAlive = true;
				break;
			case "jawbone":
			case "runkeeper":
				// 1. 執行jawbone的profile，如果值回false表示token有誤，則準備重新取一組token。
				// 2. 如果平台是runkeeper，則無需重取token。
				//console.log("cc==\n"+JSON.stringify(tokenObject));
				bTokenAlive = passport.getProfile(tokenObject[platform]);
				break;
			
		}
		console.log("token alive status:"+bTokenAlive);
		// 如果是false則要重新取token
		var renewToken;
		if( bTokenAlive==false ) {
			if( platform=="jawbone" ) {
				var refreshToken = tokenObject[platform]["refresh_token"];
				renewToken = passport.renewToken(refreshToken);
				
				// 新的token中，如果有error這個key則不更新table。反之則更新table。
				var bIsUpdate = false;
				for(var i in renewToken) {
					if( i=="error_description" || i=="error" ) {
						bIsUpdate = false;
						break;
					} else {
						bIsUpdate = true;
					}
				}
				//console.log("是否更新user table:"+bIsUpdate);
				if(bIsUpdate) {
					// 使用easyDB putData做update的動作
					var updateData = {jawbone: renewToken};
					var rs = this.db.putData("user", userId, updateData);
					console.log("更新[user] table, userId:" + userId + " 資料更新:" + rs);
					renewToken = updateData;
				}
				
			}
		} else {
			// token還活著，傳回原token。
			renewToken = tokenObject;
		}

		console.log("取得 renewToken:\n"+ JSON.stringify(renewToken));
		return renewToken;
	};
	 
	
	/**
	 * [新增] 新增資料到 xxx平台(platform table)
	 */
	var collectData = function(platform, token, userId) {
		console.log("----[collectData param] ↓↓↓----");
		console.log(token);
		console.log("----[collectData param] ↑↑↑----");
		var deviceJson = require('../../config.private/'+platform+'.json');
		var library = '../Passport/' + platform + ".js";
		var passport = new require(library)(deviceJson);
		var profile, activities, friends, nutrition, sleep;

		switch(platform) {
			case "fitbit":
				var setAccessToken = passport.renewToken(token);		// 將token設定給accessApiOauthData以利 Passport.fitbit.js 進行以下動作
				console.log("setAccessToken-->"+JSON.stringify(setAccessToken));
				var strDate = "2014-11-";
				for(var i=20; i<31; i++) {
					var day = "";
					if(i<10) {
						day = "0" + i;
					} else {
						day = i;
					}
					var dataDate = strDate + day;
					//console.log("取 "+dataDate+" 的資料");
					profile = passport.getProfile("1", ".json");
					activities = passport.getActivities("1", dataDate, ".json");
					friends = passport.getFriends("1", ".json");
					nutrition = passport.getNutrition("1", dataDate, ".json");
					sleep = passport.getSleep("1", dataDate, ".json");
					console.log("寫入" + platform + "，"+dataDate+" 的資料成功。");
				}

				break;
				
			case "jawbone":
			case "runkeeper":
				/*profile = passport.getProfile(token);
				activities = passport.getActivities(token);
				friends = passport.getFriends(token);
				nutrition = passport.getNutrition(token);
				sleep = passport.getSleep(token);
				console.log("寫入" + platform + "資料");*/
				break;
				
				
			default:
				console.log("no select platform.");
		}
		//console.log("---[取出 " + platform + " 平台的值如下]---");
		//console.log({'userId': userId, 'profile': profile, 'activities': activities, 'friends': friends, 'nutrition': nutrition, 'sleep': sleep});
		this.db.postData(platform, {'userId': userId, 'profile': profile, 'activities': activities, 'friends': friends, 'nutrition': nutrition, 'sleep': sleep});
		console.log("--- collectData postData End ---");
	};
	
	var collector = {
		init: init,
		getUserTableData: getUserTableData,
		getTableData: getTableData,
		getAllToken: getAllToken,
		getTokenByPlatform: getTokenByPlatform,
		_getTokenByPlatform: _getTokenByPlatform,
		_getTokenJsonObject: _getTokenJsonObject,
		setPlatformToken: setPlatformToken,
		checkTokenAndToActive: checkTokenAndToActive,
		collectAll: collectAll,
		collectData: collectData
	};
	return collector.init();
};
