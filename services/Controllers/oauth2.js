var config;
var public_path = 'https://googledrive.com/host/';

module.exports = {
	init: function(_config) {
		config = _config;
		public_path += config.public_path + "/";
	},
	callback: function(req, res) {
		var params = {
			uri: req.query,
			post: req.params
		};
		res.send(params);
	}
};