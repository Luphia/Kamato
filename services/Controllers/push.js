var config,
	dbConfig,
	socket;

var Result = require('../Objects/Result.js');

module.exports = {
	init: function(_config, _dbConfig) {
		if(_config) { config = _config; }
		if(_dbConfig) { dbConfig = _dbConfig; }
	},
	setSocket: function(_socket) {
		if(_socket) { socket = _socket; }
	},
	pusher: function(req, res, next) {

	},
	pushMessage: function(req, res, next) {
		res.result = new Result();

		var channel = req.params.channel,
			dist = channel || 'default',
			data = req.body;

		socket.send(data, channel);

		res.result.response(next, 1, 'send message to channel: ' + dist);
	}
};