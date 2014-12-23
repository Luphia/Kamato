/*
var config = { db: {url: 'mongodb://10.10.23.31:27010/easyDB'}, table: 'user', "collectType": {"fitbit": "date", "jawbone": "all", "runkeeper": "all"} };
var platform = 'fitbit';
config.deviceJson = {
	"jawbone": require('./config.private/jawbone.json'),
	"fitbit":  require('./config.private/fitbit.json'),
	"runkeeper": require('./config.private/runkeeper.json')
};
config.library = '../Passport/';


var callback = function() {console.log('finish %d', new Date());};
var Collector = require('./services/Jobs/Collector.js');

var collector = new Collector(config, callback);
//var collector = new Collector(config, '2014-12-20', callback);
collector.start();
 */

var util = require('util')
,	Job = require('../Classes/Job.js')
,	Calendar = require('../Classes/Calendar.js');


var Collector = function(config, date, callback) {
	this.config = config;
	this.setCallback(callback);
	this.date = date;
};


// job detail
var CollectorJob = function(config) {

	var init = function(_config) {
		this.config = _config;
		var edb = require('../Classes/EasyDB.js');
		this.db = new edb();
		this.db.connect(this.config.db);
		this.calendar = new Calendar();

		return this;
	};
	
	/**
	 * [查詢] 取得user table的資料
	 */
	var getUserTableData = function() {
		return this.db.listData(this.config.table);
	};

	/**
	 * [查詢] 取得user table中的list
	 * return data JSON資料格式
	 */
	var getAllToken = function() {
		var list = this.db.listData(this.config.table).list;
		return list;
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
	 * [新增]
	 * 依據user table中的資料，寫入各個user之平台的運動資料。
	 */
	var collectAll = function(date, callback) {
		console.log("--- collectAll postData Start ---");
		var userAllToken = this.getAllToken();
		for(var i=0; i<userAllToken.length; i++) {
			for(var listKey in userAllToken[i]) {
				var userId = userAllToken[i]["_id"];;
				//console.log(listKey + " : " + userAllToken[i][listKey]);
				if( listKey!="_id" ) {
					console.log("date:"+date);
					//var now = date===undefined? this.calendar.nowDate() : date;
					var now = date===this.calendar.nowDate()? this.calendar.nowDate() : date;
					console.log("now: "+ now);
					console.log("平台:" +listKey+ ", 模式:" + this.config.collectType[listKey]);
					
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
					var startNumOfDaysAll = this.calendar.daysInMonth(parseInt(startDate.split('-')[0]), parseInt(startDate.split('-')[1]));
					var endNumOfDaysAll = this.calendar.daysInMonth(parseInt(endDate.split('-')[0]), parseInt(endDate.split('-')[1]));
					console.log("start: "+startDate+"\tend: "+endDate);
					//console.log(parseInt(startDate.split('-')[1])+"月份共有"+startNumOfDaysAll+"天");
					//console.log(parseInt(endDate.split('-')[1])+"月份共有"+endNumOfDaysAll+"天");
					var startNumOfDays = startNumOfDaysAll - parseInt(startDate.split('-')[2]);
					var endNumOfDays = endNumOfDaysAll - parseInt(endDate.split('-')[2]);
					//console.log(parseInt(startDate.split('-')[1])+"月份需取"+startNumOfDays+"天的資料");
					//console.log(parseInt(endDate.split('-')[1])+"月份共有"+endNumOfDays+"天的資料");
					
					// 月份相同
					if( parseInt(startDate.split('-')[1])==parseInt(endDate.split('-')[1]) ) {
						var month = "", day = "";
						if(parseInt(startDate.split('-')[1])<10) {
							month = "0" + parseInt(startDate.split('-')[1]);
						} else {
							month = parseInt(startDate.split('-')[1]);
						}
						
						for(var day_i=parseInt(startDate.split('-')[2]); day_i<=parseInt(endDate.split('-')[2]); day_i++) {
							if(day_j<10) {
								day = "0" + day_j;
							} else {
								day = day_j;
							}
							var getDataDate = startDate.split('-')[0] +"-"+ month +"-"+ day;		// 寫入資料
							// 1. [刪除]當日資料
							var cond = "WHERE userId=" + userId + " AND date='" + getDataDate + "'";		// 刪除資料的條件
							this.db.deleteData(listKey, cond);
							
							console.log("寫入開始月份的資料_"+getDataDate);
							this.collectData(listKey, renewToken[listKey], userId, getDataDate);		// 寫入資料
						}

					} else if( parseInt(startDate.split('-')[1])<parseInt(endDate.split('-')[1]) ) {

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
							var tmpEnd = this.calendar.daysInMonth(parseInt(startDate.split('-')[0]), month_i);
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
						}
					}
					*/
					//+++--------- [批量寫入資料] 一次抓取大量fitbit、jawbone、runkeeper資料，用以擷取大量資料做為測試用。

					this.collectData(listKey, renewToken[listKey], userId, now);		// 寫入資料
				}
			}
		}
		console.log("--- collectAll postData End ---");
		if(typeof(callback) == 'function') { callback(); }
	};

	/**
	 * 檢查該平台之token是否存活著，如不存在則重新取得token並更新table。
	 * param {platform} 平台名稱
	 * param {tokenObject} (Json Object)token
	 * param {userId} 使用者id (_id)
	 */
	var checkTokenAndToActive = function(platform, tokenObject, userId) {
		//var deviceJson = require('../../config.private/'+platform+'.json');
		//var library = '../Passport/' + platform + ".js";
		platformName = platform.substr(0,1).toUpperCase() + platform.substr(1);
		var passport = new require(this.config.library)[platformName](this.config.deviceJson[platform]);
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
					var rs = this.db.putData(this.config.table, userId, updateData);
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
		//var deviceJson = require('../../config.private/'+platform+'.json');
		//var library = '../Passport/' + platform + ".js";
		var passport = new require(this.config.library)[platformName](this.config.deviceJson[platform]);
		var rs, profile, activities, friends, nutrition, sleep;

		switch(platform) {
			case "fitbit":
				//var setAccessToken = passport.renewToken(token);		// 將token設定給accessApiOauthData以利 Passport.fitbit.js 進行以下動作
				//console.log("{setAccessToken}-->"+JSON.stringify(setAccessToken));
				profile = passport.getProfile(token);
				activities = passport.getActivities(token, dataDate);
				friends = passport.getFriends(token);
				nutrition = passport.getNutrition(token, dataDate);
				sleep = passport.getSleep(token, dataDate);
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

	var collectorJob = {
		init: init,
		getUserTableData: getUserTableData,
		getAllToken: getAllToken,
		_getTokenByPlatform: _getTokenByPlatform,
		_getTokenJsonObject: _getTokenJsonObject,
		checkTokenAndToActive: checkTokenAndToActive,
		collectAll: collectAll,
		collectData: collectData
	};
	return collectorJob.init(config);
};


Collector.prototype = new Job();
Collector.prototype.work = function() {
	// do job
	var calendar = new Calendar();
	var job = new CollectorJob(this.config);
	var insCollectAll = job.collectAll( typeof this.date!='function'? this.date: calendar.nowDate(), this.done );
};



module.exports = Collector;