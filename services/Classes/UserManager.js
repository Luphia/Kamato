/*
	user table:
		_id, account, password(sha1), picture, google, facebook, fitbit, nikeplus, jawbone, runkeeper
 */

module.exports = function(EasyDB) {
	var init = function(EasyDB) {
		this.DB = EasyDB;
		return this;
	}
	// data = { account, password }
	// return = { _id, name, picture } || false
	,	login = function(data) {}

	// data = { account, password }
	// return = _id || false (account exist)
	,	add = function(data) {}

	// data = { platform, userData }
	// return = _id || false (platform userData exist)
	,	addByPlatform = function(data) {}

	// data = { platform, userData }
	// return = { _id, name, picture } || false (not found)
	,	findByPlatform = function(data) {}

	// data = _id
	// return = { _id, name, picture } || false (not found)
	,	findByID = function(data) {}

	// data = { _id, platform, userData }
	// return = true || false (not found)
	,	addToken = function(data) {}

	// data = _id
	// return = row data || false (not found)
	,	getData = function(data) {}
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