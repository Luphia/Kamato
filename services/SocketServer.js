/*
	{
		"user": {
			"name": "BOT"
		},
		"message": "Hello World!",
		"eventType":"new message"
	}
 */

var config,
	server,
	secureServer,
	io,
	logger,
	route,
	db,
	active,
	limit = 20;

var redis = require('socket.io-redis'),
	MongoClient = require('mongodb').MongoClient,
	url = require('url'),
	Result = require('./Objects/Result.js');

var usernames = {},
	numUsers = 0;

var configure = function(_config, _server, _secureServer, _logger, _route) {
	config = _config;
	server = _server;
	secureServer = _secureServer;
	logger = _logger;
	route = _route;
	io = require('socket.io').listen(server);
	io.adapter(redis(config.get('redis')));
	secureServer && (io.listen(secureServer));

	db = dbconn(config.get('mongo'));
};

var dbconn = function(option) {
	var rs,
		dbURL = url.parse(option.uri);;

	!option && (option = {});
	option.protocol = 'mongodb:';
	option.pathname = '/pushServer';
	option.slashes = true;
	!option.host && (option.host = dbURL.host);
	!option.port && (option.port = dbURL.port);

	MongoClient.connect(url.format(option), function(err, _db) {
		if(err) {
			logger.exception.error(err);
			rs = false;
		}

		rs = _db;
	});

	while(rs === undefined) {
		require('deasync').runLoopOnce();
	}
	return rs;
};

var start = function() {
	var self = this;
	io.on('connection', function (socket) {
		var addedUser = false;
		socket.channel = [];
		// when the client emits 'new message', this listens and executes
		socket.on('new message', function (data) {
			var msg = {
				user: {
					uid: socket.id,
					ip: socket.handshake.address.address,
					name: socket.username
				},
				channel: data.channel,
				message: data,
				timestamp: new Date()
			};

			// we tell the client to execute 'new message'
			socket.broadcast.emit('new message', msg);

			log(msg);
			//self.send();
		});

		// get channel history
		socket.on('load message', function(data) {
			var channel = data.channel || 'default';
			var timestamp = new Date(data.timestamp);
			var cond = {};

			if(data.limit) { limit = data.limit; }
			if(data.channel) { cond.channel = data.channel; }
			if(data.timestamp) { cond.timestamp = { $lt: new Date(data.timestamp) }; }

			db.collection('messages').find(cond).sort({'timestamp': -1}).limit(limit).toArray(function(_err, _data) {
				socket.emit('load message', {
					channel: channel,
					messages: _data
				});
			});
		});

		// get channel list
		socket.on('get channel', function(data) {

		});

		// when the client emits 'add user', this listens and executes
		socket.on('add user', function (username) {
			// we store the username in the socket session for this client
			socket.username = username;
			// add the client's username to the global list
			usernames[username] = username;
			++numUsers;
			addedUser = true;
			socket.emit('login', {
				numUsers: numUsers,
				timestamp: new Date()
			});
			// echo globally (all clients) that a person has connected
			socket.broadcast.emit('user joined', {
					user: {
					name: socket.username
				},
				numUsers: numUsers,
				timestamp: new Date()
			});
		});

		// when the client emits 'typing', we broadcast it to others
		socket.on('typing', function () {
			socket.broadcast.emit('typing', {
				user: {
					name: socket.username
				},
				timestamp: new Date()
			});
		});

		// when the client emits 'stop typing', we broadcast it to others
		socket.on('stop typing', function () {
			socket.broadcast.emit('stop typing', {
				user: {
					name: socket.username
				},
				timestamp: new Date()
			});
		});

		// when the user disconnects.. perform this
		socket.on('disconnect', function () {
			// remove the username from global usernames list
			if (addedUser) {
				delete usernames[socket.username];
				--numUsers;

				// echo globally that this client has left
				socket.broadcast.emit('user left', {
					user: {
						name: socket.username
					},
					numUsers: numUsers,
					timestamp: new Date()
				});
			}
		});

		// when the user join some channel
		socket.on('join', function (room) {
			socket.join(room);
			socket.channel.indexOf(room) == -1 && socket.channel.push(room);
		});

		// where the user leave some channel
		socket.on('leave', function (room) {
			socket.leave(room);
			socket.channel.splice(socket.channel.indexOf(room), 1);
		});
	});

	//push service
	route('all', '/push/', module.exports.pushMessage);
	route('all', '/push/:channel', module.exports.pushMessage);

	logger.info.info("Socket start");
	active = true;
};
var log = function(message) {
	!message.channel && (message.channel = 'default');
	db.collection('messages').insert(message, function(_err, _data) { if(_err) logger.exception.error(_err); });
	return true;
};
var send = function(data, channel) {
	if(!data) { return false;}
	if(!active) { return true;}

	var sender = channel? io.to(channel): io,
		eventType = data.eventType;

	data.timestamp = new Date();
	data.channel = channel;

	sender.emit(eventType, data);
	log(data);

	return true;
};
var pushMessage = function(req, res, next) {
	res.result = new Result();

	var channel = req.params.channel,
		dist = channel || 'default',
		data = req.body;

	send(data, channel);
	res.result.response(next, 1, 'send message to channel: ' + dist);
};

module.exports = {
    configure: configure,
    start: start,
    send: send,
    pushMessage: pushMessage
}