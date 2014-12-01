module.exports = function(EasyDB) {
	var init = function(EasyDB) {
		this.DB = EasyDB;
		return this;
	}
	// data = { account, password }
	,	login = function(data) {}

	// data = { account, password, }
	,	add = function(data) {}
	,	addByPlatform = function(data) {}
	,	findByPlatform = function(data) {}
	,	findByID = function(data) {}
	,	addToken = function(data) {}
	;

	var um = {
		init: init,
		login: login,
		add: add,
		addByPlatform: addByPlatform,
		findByPlatform: findByPlatform,
		findByID: findByID,
		addToken: addToken
	};

	return um.init(EasyDB);
}