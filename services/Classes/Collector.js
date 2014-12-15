/**
Collector物件

搜集資料的程式
依 user table 所有的人之各平台token，進行該user於xxx運動平台(如：Fitbit、jawbone、runkeeper)之資料搜集的動作。
並將取得之值寫入各平台之table中，做為Kamato整合平台之用。


+----------+
| 使用方法 |
+----------+
	cd ~/Kamato
	node
	
var collector = new require('./services/Classes/Collector.js')();
var getAllTokenData = collector.getAllToken();
var setDate = collector.setDate('2014-12-11');		// 該行為抓取指定fitbit特定日期資料時使用，平時不用使用此行。
var insCollectAll = collector.collectAll(getAllTokenData);

*/

var calendar = require('./Calendar.js')();
/*
	做搜集資料寫入table的模式，依平台分為兩種模式。
	all: 全資料
	date: 取指定日期之資料(通常取當日資料)
*/
var collectType = {
	"fitbit": "date",
	"jawbone": "all",
	"runkeeper": "all"
};
var _assignDate;

module.exports = function() {

	var init = function() {
		var edb = require('./EasyDB.js');
		this.db = new edb();
		this.db.connect({url: 'mongodb://10.10.23.31:27010/easyDB'});
		this.db.setSchema("user", "JSON");
		var columnType = {userId: 'Number', profile: 'JSON', activities: 'JSON', friend: 'JSON', nutrition: 'JSON', sleep: 'JSON', date: 'Date'};
		this.db.setSchema("fitbit", columnType);
		this.db.setSchema("jawbone", columnType);
		this.db.setSchema("runkeeper", columnType);
		
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
	console.log("platform:"+platform+"\tuserId:"+userId);
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
	 * 指定取資料的日期(該function適用於fitbit)
	 * param {date} 日期。(YYYY-MM-DD)
	 */
	var setDate = function(date) {
		_assignDate = date;
	};
	
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
					console.log("_assignDate:"+_assignDate);
					var now = _assignDate===undefined? calendar.nowDate() : _assignDate;
					console.log("now: "+ now);
					console.log("平台:" +listKey+ ", 模式:" + collectType[listKey]);
					
					// 1. [刪除]當日資料
					var cond = "WHERE userId=" + userId + " AND date='" + now + "'";		// 刪除資料的條件
					this.db.deleteData(listKey, cond);

					// 2. [新增]當日資料					
					var token = this._getTokenByPlatform(listKey, userAllToken[i][listKey]);
					//console.log("token-->"+token);

					var renewToken = {};
					//console.log("----------[collectAll Debug] ↓↓↓---------");
					var getJsonTokenData = this._getTokenJsonObject(listKey, userId);
					//console.log("原{token}:\n"+JSON.stringify(getJsonTokenData));
					//console.log("-------");
					renewToken = this.checkTokenAndToActive(listKey, getJsonTokenData, userId);		// 取得新的token
					//console.log("----------[collectAll Debug] ↑↑↑---------");

					// 取出各平台token，並取得各動作之值，將其值寫入table。
					
					//---------+++ [批量寫入資料] 一次抓取大量fitbit、jawbone、runkeeper資料，用以擷取大量資料做為測試用。
					// 該功能平時不使用，此功能只為批量取得大量資料時用。
					// 資料從2014-11-20開始有資料
					/*
					var startDate = '2014-11-20', endDate = '2014-12-14';
					var startNumOfDaysAll = calendar.daysInMonth(parseInt(startDate.split('-')[0]), parseInt(startDate.split('-')[1]));
					var endNumOfDaysAll = calendar.daysInMonth(parseInt(endDate.split('-')[0]), parseInt(endDate.split('-')[1]));
					console.log("start: "+startDate+"\tend: "+endDate);
					//console.log(parseInt(startDate.split('-')[1])+"月份共有"+startNumOfDaysAll+"天");
					//console.log(parseInt(endDate.split('-')[1])+"月份共有"+endNumOfDaysAll+"天");
					var startNumOfDays = startNumOfDaysAll - parseInt(startDate.split('-')[2]);
					var endNumOfDays = endNumOfDaysAll - parseInt(endDate.split('-')[2]);
					//console.log(parseInt(startDate.split('-')[1])+"月份需取"+startNumOfDays+"天的資料");
					//console.log(parseInt(endDate.split('-')[1])+"月份共有"+endNumOfDays+"天的資料");
					
					// 分3段取資料
					// 開始的那個月為一段
					for(var day_i=parseInt(startDate.split('-')[2]); day_i<=startNumOfDaysAll; day_i++) {
						if(day_i<10) {
							day = "0" + day_i;
						} else {
							day = day_i;
						}
						var getDataDate = startDate.split('-')[0] +"-"+ startDate.split('-')[1] +"-"+ day
						// 1. [刪除]當日資料
						var cond = "WHERE userId=" + userId + " AND date='" + getDataDate + "'";		// 刪除資料的條件
						this.db.deleteData(listKey, cond);
						
						console.log("寫入開始月份的資料_"+getDataDate);
						this.collectData(listKey, renewToken[listKey], userId, getDataDate);		// 寫入資料
					}
					// 中間一段(數個月)
					for(var month_i=parseInt(startDate.split('-')[1])+1; month_i<parseInt(endDate.split('-')[1]); month_i++) {
						var tmpEnd = calendar.daysInMonth(parseInt(startDate.split('-')[0]), month_i);
						for(var day_j=1; day_j<=tmpEnd; day_j++) {
							var month = "", day = "";
							if(month_i<10) {
								month = "0" + month_i;
							} else {
								month = month_i;
							}
							if(day_j<10) {
								day = "0" + day_j;
							} else {
								day = day_j;
							}
							var getDataDate = startDate.split('-')[0] +"-"+ month +"-"+ day;		// 寫入資料
							// 1. [刪除]當日資料
							var cond = "WHERE userId=" + userId + " AND date='" + getDataDate + "'";		// 刪除資料的條件
							this.db.deleteData(listKey, cond);
							
							console.log("寫入中間數月各日的資料_"+getDataDate);
							this.collectData(listKey, renewToken[listKey], userId, getDataDate);		// 寫入資料
						}
					}
					// 結束的那個月為一段
					for(var day_i=1; day_i<=parseInt(endDate.split('-')[2]); day_i++) {
						var day = "";
						if(day_i<10) {
							day = "0" + day_i;
						} else {
							day = day_i;
						}
						var getDataDate = endDate.split('-')[0] +"-"+ endDate.split('-')[1] +"-"+ day;		// 寫入資料
						// 1. [刪除]當日資料
						var cond = "WHERE userId=" + userId + " AND date='" + getDataDate + "'";		// 刪除資料的條件
						this.db.deleteData(listKey, cond);
						
						
						console.log("寫入結束月份的各日之資料_"+getDataDate);
						this.collectData(listKey, renewToken[listKey], userId, getDataDate);		// 寫入資料
					}*/
					//+++--------- [批量寫入資料] 一次抓取大量fitbit、jawbone、runkeeper資料，用以擷取大量資料做為測試用。

					this.collectData(listKey, renewToken[listKey], userId, now);		// 寫入資料
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
				// 1. 執行jawbone的profile，如果值傳回false表示token有誤，則準備重新取一組token。
				// 2. 如果平台是runkeeper，則無需重取token。
				//console.log("{tokenObject}==\n"+JSON.stringify(tokenObject));
				if( typeof passport.getProfile(tokenObject[platform]) == 'object' ) {
					var statusCode = passport.getProfile(tokenObject[platform]).meta.code;
					bTokenAlive = statusCode==200? true : false;
				} else {
					bTokenAlive = false;
				}
				break;
			case "runkeeper":
				bTokenAlive = true;
				break;
		}
		console.log("token alive status:"+JSON.stringify(bTokenAlive));
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
	 * param {platform} 平台名稱
	 * param {tokenObject} (Json Object)token
	 * param {userId} 使用者id (_id)
	 * param {dataDate} 欲取得資料的日期。該參數適用於取fitbit資料。也會將此日期寫入table中。
	 */
	var collectData = function(platform, token, userId, dataDate) {
		//console.log("----[collectData param] ↓↓↓----");
		//console.log(token);
		//console.log("----[collectData param] ↑↑↑----");
		var deviceJson = require('../../config.private/'+platform+'.json');
		var library = '../Passport/' + platform + ".js";
		var passport = new require(library)(deviceJson);
		var rs, profile, activities, friends, nutrition, sleep;

		switch(platform) {
			case "fitbit":
				var setAccessToken = passport.renewToken(token);		// 將token設定給accessApiOauthData以利 Passport.fitbit.js 進行以下動作
				//console.log("{setAccessToken}-->"+JSON.stringify(setAccessToken));
				profile = passport.getProfile("1", ".json");
				activities = passport.getActivities("1", dataDate, ".json");
				friends = passport.getFriends("1", ".json");
				nutrition = passport.getNutrition("1", dataDate, ".json");
				sleep = passport.getSleep("1", dataDate, ".json");
				break;
				
			case "jawbone":
			case "runkeeper":
				profile = passport.getProfile(token);
				activities = passport.getActivities(token);
				friends = passport.getFriends(token);
				nutrition = passport.getNutrition(token);
				sleep = passport.getSleep(token);
				break;
				
			default:
				console.log("no select platform.");
		}
		//console.log("---[取出 " + platform + " 平台的值如下]---");
		//console.log({'userId': userId, 'profile': profile, 'activities': activities, 'friends': friends, 'nutrition': nutrition, 'sleep': sleep});
		rs = this.db.postData(platform, {'userId': userId, 'profile': profile, 'activities': activities, 'friends': friends, 'nutrition': nutrition, 'sleep': sleep, 'date': dataDate});
		console.log("寫入" + platform + "，"+dataDate+" 的資料，_id: " + rs);
		return rs;
		console.log("--- collectData postData End ---");
	};
	
	var deleteData = function(userId, date) {
		
	};
	
	var collector = {
		init: init,
		getUserTableData: getUserTableData,
		getTableData: getTableData,
		setDate: setDate,
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
