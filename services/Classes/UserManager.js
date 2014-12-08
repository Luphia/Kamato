/*
	user table:
		_id, account, password(sha1), name, picture, google, facebook, fitbit, nikeplus, jawbone, runkeeper
 */
var crypto = require('crypto');
var nodemailer = require('nodemailer');

function random(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
module.exports = function (EasyDB) {
    var init = function (EasyDB) {
        this.DB = EasyDB;
        return this;
    }
	// data = { account, password }
	// return = { _id, name, picture } || false
	, login = function (data) {
	    var db = this.DB;

	    var account = data.account;
	    var password = data.password;

	    password = crypto.createHash('sha1').update(password).digest('hex');
	    var dbt = db.listData('users', "account='" + account + "'").list[0];
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

	    var account = data.account;
	    var password = data.password;

	    if (account.length == 0 || password.length == 0) {
	        return false;
	    };

	    password = crypto.createHash('sha1').update(password).digest('hex');

	    var dbt = db.listData('users', "account='" + account + "'").list[0];
	    if (dbt) {
	        return false; // 'account exist';
	    } else {
	        var id = db.postData('users', { account: account, password: password });
	        console.log(db.listData('users'))

	        return { _id: id };
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
	        var id = db.postData('users', dbj);

	        return { _id: id };
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

	    var dbt = db.listData('users', "_id='" + _id + "'").list[0];
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

	    var dbt = db.listData('users', "_id='" + _id + "'").list[0];
	    if (dbt) {
	        var dbj = {};
	        dbj[platform] = userData;
	        db.postData('tokens', dbj);
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

	    var dbt = db.listData('users', "_id='" + _id + "'").list[0];
	    if (dbt) {
	        return dbt;
	    } else {
	        return false; // 'not found';
	    };
	}
    , forgot = function (data) {
        var db = this.DB;

        var account = data.account;
        var check = random(32767, 0);
        var Mailconfig = require('../../config/Mail.json');

        var faccount = crypto.createHash('md5').update(account + check).digest('hex');
        var dbt = db.listData('users', "account='" + account + "'").list[0];
        if (dbt) {
            var id = dbt._id;
            var ans = db.putData('users', id, { password: faccount });
            console.log(ans)
            if (ans == true) {
                var Mailconfig = require('../../config/Mail.json');
                var transporter = nodemailer.createTransport(Mailconfig);

                //var content = "<a href='http://localhost/repassword?a=" + account + "&p=" + faccount + "'>請點選連結重新設定您的密碼</a>";
                var content = "<a href=http://localhost/widgets/platform/superAdmin_template/login.html?a=" + account + "&p=" + faccount + "'>請點選連結重新設定您的密碼</a>";

                var Mailopt = {
                    from: '資策會測試 ✔ <' + Mailconfig.auth.user + '>', // sender address
                    to: account, // list of receivers
                    subject: '重設密碼認證函', // Subject line
                    html: content, // html body
                };

                // send mail with defined transport object
                transporter.sendMail(Mailopt, function (error, info) {
                    if (error) {
                        console.log(error);
                        return false;
                    } else {
                        console.log('Message sent: ' + info.response);
                        return true;
                    };
                });
            };

        } else {
            return false; // 'not found';
        };
    }
    , repassword = function (data) {
        var db = this.DB;

        var oldpass = data.oldpass;
        var newpass = data.newpass;
        console.log(data)
        var dbt = db.listData('users', "password='" + oldpass + "'").list[0];
        console.log(db.listData('users'))
        if (dbt) {
            var id = dbt._id;
            db.putData('users', id, { password: newpass });
            return true;
        } else {
            return false; // 'not found';
        };




        console.log(data)


        return true;
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
        getData: getData,
        forgot: forgot,
        repassword: repassword
    };

    return um.init(EasyDB);
}