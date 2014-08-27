var index = function(req, res){
	res.render('index');
};

var google = require('./google.js'),
	facebook = require('./facebook.js'),
	oauth2 = require('./oauth2.js'),
	user = require('./user.js');

module.exports = function(_config) {
	google.init(_config.get('google'));
	facebook.init(_config.get('facebook'));

	return {
		index: index,
		google: google,
		facebook: facebook,
		oauth2: oauth2,
		user: user
	}
};