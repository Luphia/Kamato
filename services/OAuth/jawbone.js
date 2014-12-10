/*
	config = {
		client:
		secret:
		path:
	}

	<form method="POST" action="https://jawbone.com/auth/oauth2/auth">
		<input name="response_type" />
		<input name="client_id" />
		<input name="scope" />
		<input name="redirect_uri" />
		<input type="submit" />
	</form>
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