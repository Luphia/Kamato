var config,
	server,
	io,
	logger;

var usernames = {},
	numUsers = 0;

var configure = function (_config, _server, _logger) {
	config = _config;
	server = _server;
	logger = _logger;
	io = require('socket.io')(server);
};

var start = function () {
	io.on('connection', function (socket) {
		var addedUser = false;

		// when the client emits 'new message', this listens and executes
		socket.on('new message', function (data) {
			// we tell the client to execute 'new message'
			socket.broadcast.emit('new message', {
				user: {
					name: socket.username
				},
				message: data,
				timestamp: new Date()
			});
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
	});
}

module.exports = {
    configure: configure,
    start: start
}