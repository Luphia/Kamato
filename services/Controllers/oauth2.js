var config;

module.exports = {
	init: function(_config) {
		config = _config;
	},
	callback: function(req, res) {
		var params = {
			uri: req.query,
			post: req.params
		};
		res.send(params);
	}
};