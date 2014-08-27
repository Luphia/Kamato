var config;

module.exports = {
	init: function(_config) {
		config = _config;
	},
	data: function(req, res) {
		var userData = req.session || {};
		userData.ip = req.connection.remoteAddress;
		res.send(userData);
	}
};