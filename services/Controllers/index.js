var index = function(req, res){
	res.render('index');
};

var google = require('./google.js');

module.exports = function(_config) {
	google.init(_config.get('google'));

	return {
		index: index,
		google: google
	}
};