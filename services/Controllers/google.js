var config;
var public_path = 'https://googledrive.com/host/';

module.exports = {
	init: function(_config) {
		config = _config;
		public_path += config.public_path + "/";
	},
	file: function(req, res) {
		var filename = req.params.filename;
		res.writeHead(307, {
			"Location": public_path + filename
		});
		res.end();
	}
};