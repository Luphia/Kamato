var config,
	io;

module.exports = {
	init: function(_config, _io) {
		if(_config) { config = _config; }
		if(_io) { io = _io; }
	},
	pushMessage: function(req, res, next) {
		var channel = req.params.channel;
	}
};