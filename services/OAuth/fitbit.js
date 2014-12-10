/*
	config = {
		client:
		secret:
		path:
	}
 */


var config,
	db;



module.export = function() {
	var init = function(_config, _db) {
		config = _config;
		db = _db;
	};

	var api = {
		init: init,
		getAuthPage: getAuthPage,
		getToken: getToken,
		getFriends: getFriends,
		getActivities: getActivities
	};

	return api.init();
};