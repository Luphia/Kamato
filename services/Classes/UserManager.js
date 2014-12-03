/*
	user table:
		_id, account, password(sha1), name, picture, google, facebook, fitbit, nikeplus, jawbone, runkeeper
 */
var crypto = require('crypto');

module.exports = function (EasyDB) {
    var init = function (EasyDB) {
        this.DB = EasyDB;
        return this;
    }
	// data = { account, password }
	// return = { _id, name, picture } || false
	, login = function (data) {
	    var db = this.DB;

	    var hash;
	    var account = data.account;
	    var password = data.password;

	    hash = crypto.createHash('sha1');
	    hash.update(password);
	    password = hash.digest('hex');
	    var dbt = db.listData('users', "account=" + account).list[0];
	    if (dbt) {
	        var vpassword = dbt.password;
	        if (vpassword == password) {
	            return { _id: dbt._id, name: dbt.name, picture: dbt.picture };
	        } else {
	            return false;
	        };
	    } else {
	        return false;
	    };
	}

	// data = { account, password }
	// return = _id || false (account exist)
	, add = function (data) {
	    var db = this.DB;

	    var hash;
	    var account = data.account;
	    var password = data.password;

	    hash = crypto.createHash('sha1');
	    hash.update(password);
	    password = hash.digest('hex');
	    var dbt = db.listData('users', "account=" + account).list[0];
	    if (dbt) {
	        return false; // 'account exist';
	    } else {
	        db.postData('users', { account: account, password: password });
	        return { _id: dbt._id };
	    };
	}

	// data = { platform, userData }
	// return = _id || false (platform userData exist)
	, addByPlatform = function (data) {
	    var db = this.DB;

	    var platform = data.platform;
	    var userData = data.userData;

	    var dbt = db.listData('users', platform).list[0];
	    if (dbt) {
	        return false; // 'platform userData exist';
	    } else {

	        var dbj = { name: userData.data[0].name, picture: userData.data[0].picture };
	        dbj[platform] = userData;
	        db.postData('users', dbj);

	        return { _id: dbt._id };
	    };
	}

	// data = { platform, userData }
	// return = { _id, name, picture } || false (not found)
	, findByPlatform = function (data) {
	    var db = this.DB;

	    var platform = data.platform;
	    var userData = data.userData;

	    var dbj = {};
	    dbj[platform] = userData;

	    var dbt = listData('users', dbj).list[0];

	    if (dbt) {
	        return { _id: dbt._id, name: dbt.name, picture: dbt.picture };
	    } else {
	        return false; //'not found';
	    };
	}

	// data = _id
	// return = { _id, name, picture } || false (not found)
	, findByID = function (data) {
	    var db = this.DB;

	    var _id = data._id;

	    var dbt = db.listData('users', "_id=" + _id).list[0];
	    if (dbt) {
	        return { _id: dbt._id, name: dbt.name, picture: dbt.picture };
	    } else {
	        return false; // 'not found';
	    };
	}

	// data = { _id, platform, userData }
	// return = true || false (not found)
	, addToken = function (data) {
	    var db = this.DB;

	    var _id = data._id;
	    var platform = data.platform;
	    var userData = data.userData;

	    var dbt = db.listData('users', "_id=" + _id).list[0];
	    if (dbt) {
	        var dbj = {};
	        dbj[platform] = userData;
	        db.postData('users', dbj);	        
	        return true;
	    } else {
	        return false; // 'not found';
	    };
	}

	// data = _id
	// return = row data || false (not found)
	, getData = function (data) {
	    var db = this.DB;

	    var _id = data._id;

	    var dbt = db.listData('users', "_id=" + _id).list[0];
	    if (dbt) {
	        return dbt;
	    } else {
	        return false; // 'not found';
	    };
	}
    ;

    var um = {
        init: init,
        login: login,
        add: add,
        addByPlatform: addByPlatform,
        findByPlatform: findByPlatform,
        findByID: findByID,
        addToken: addToken,
        getData: getData
    };

    return um.init(EasyDB);
}