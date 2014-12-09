module.exports = function(_config) {
	var init = function() {}
	,	getAuthLink = function() {}
	,	getToken = function() {}
	,	renewToken = function() {}
	,	getProfile = function() {}
	,	getFriends = function() {}
	,	getActivities = function() {}
	,	getNutrition = function() {}
	,	getSleep = function() {}
	,	getPhysiological = function() {}
	;

	var passport = {
		"init": init,
		"getAuthLink": getAuthLink,
		"getToken": getToken,
		"renewToken": renewToken,
		"getProfile": getProfile,
		"getFriends": getFriends,
		"getActivities": getActivities,
		"getNutrition": getNutrition,
		"getSleep": getSleep,
		"getPhysiological": getPhysiological
	};
	return passport.init(_config);
};