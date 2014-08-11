var config,
	logger,
	io;

var IO = require('socket.io-emitter'),
	Twitter = require('node-tweet-stream');



var configure = function (_config, _logger) {
	config = _config;
	logger = _logger;
	io = IO(config.get('redis'));
};

var start = function () {
	ts = new Twitter(config.get('twitter'));
	ts.on('tweet', function (tweet) {
		io.to('twitter').emit('new message', {
			user: {
				name: tweet.user.name,
				image: tweet.user.profile_image_url
			},
			message: tweet.text,
			timestamp: new Date(tweet.created_at)
		});
	});

	ts.on('error', function (err) {
		// console.log('Something wrong with twitter streaming');
	});

	ts.track('node');

	console.log("Twitter start");
}

module.exports = {
	configure: configure,
	start: start
}