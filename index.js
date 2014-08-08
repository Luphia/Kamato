#!/usr/bin/env node

// Setup basic express server
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var routes = require('./services/Controllers');
var path = require('path');
var app = express();
var RedisStore = require('connect-redis')(session);
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Twitter = require('node-tweet-stream')

// Load config
var configure = require('./config');


// Setup Logger
var log4js = require('log4js');
log4js.configure(configure.log4js);
var logger = log4js.getLogger('Kamato.INFO');
logger.setLevel('INFO');


// Setup Server
app.use(session({
  store: new RedisStore(configure.redis),
  secret: 'D*#A*2.32u03w;QI^QI^@U)#VUvu',
  resave: true,
  saveUninitialized: true
}));
app.set('port', process.env.PORT || 80);
app.set('view engine', 'jade');
app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO, format: ':method :url' }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(path.join(__dirname, 'public')));

server.listen(app.get('port'), function () {
  logger.info('Server listening at port %d', app.get('port'));
});

// Routes
app.get('/public/:filename', routes.google.file);

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;


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

// Twitter streaming
/*
var ts = new Twitter(configure.twitter);
ts.on('tweet', function (tweet) {
  io.emit('new message', {
    user: {
      name: tweet.user.name,
      image: tweet.user.profile_image_url
    },
    username: tweet.user.name,
    message: tweet.text,
    timestamp: new Date(tweet.created_at)
  });
  // console.log('tweet received', tweet);
});

ts.on('error', function (err) {
  // console.log('Something wrong with twitter streaming');
});

ts.track('node');
*/