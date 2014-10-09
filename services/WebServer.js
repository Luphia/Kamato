var express = require('express'),
	favicon = require('serve-favicon'),
	fs = require('fs'),
	path = require('path'),
	session = require('express-session'),
	RedisStore = require('connect-redis')(session),
	bodyParser = require('body-parser'),
	oauthserver = require('oauth2-server'),
	methodOverride = require('method-override');

var config,
	app,
	server,
	secureServer,
	oauth,
	socket,
	log4js,
	logger,
	controllers,
	ssl,
	operator;

var configure = function (_config, _app, _server, _secureServer, _oauth, _socket, _log4js, _logger) {
	config = _config;
	app = _app;
	server = _server;
	secureServer = _secureServer;
	oauth = _oauth;
	socket = _socket;
	log4js = _log4js;
	logger = _logger;
	controllers = require('./Controllers')(config);
};

var start = function () {
	app.use(session({
		store: new RedisStore(configure.redis),
		secret: config.get('server').secret,
		resave: true,
		saveUninitialized: true
	}));

	app.oauth = oauthserver({
		model: oauth,
		grants: ['password', 'refresh_token'],
		debug: false
	});
	operator = app.oauth.grant();
	controllers.oauth2.init(config, oauth, operator);
	controllers.push.setSocket(socket);

	app.set('port', config.get('server').port);
	app.set('https', config.get('server').https);
	app.set('view engine', 'jade');

	app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO }));
	//app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO, format: ':method :url' }));
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
	app.use(controllers.filters.preprocessor);

	app.use(methodOverride('X-HTTP-Method-Override'));
	app.use(express.static(path.join(__dirname, '../public')));
	app.use(favicon(path.join('public/res/favicon.ico')));

	var router = express.Router();
	app.use(router);
	app.use(controllers.filters.errResponse);
	app.use(controllers.filters.response);

	//Routes
	router.post('/oauth/token', controllers.oauth2.createToken);
	router.get('/oauth/token/:token', controllers.oauth2.checkToken);
	router.delete('/oauth/token/:token', controllers.oauth2.deleteToken);
	router.get('/oauth/renew/:token', controllers.oauth2.renewToken);

	router.all('/oauth2/*', controllers.oauth2.callback);
	router.get('/public/*', controllers.google.file);
	router.get('/secret/*', app.oauth.authorise(), function (req, res) {
		res.send('Secret area');
	});

	// easyDB
	router.all('/db/', app.oauth.authorise(), controllers.easyDB.route);
	router.all('/db/:table', app.oauth.authorise(), controllers.easyDB.route);
	router.all('/db/:table/:id', app.oauth.authorise(), controllers.easyDB.route);

	//push service
	router.all('/push/', controllers.push.pushMessage);
	router.all('/push/:channel', controllers.push.pushMessage);

	// user data
	router.get('/me', controllers.user.data);

	// google auth
	router.get('/auth/google', controllers.google.auth);
	router.get('/auth/google/return', controllers.google.authReturn);

	// facebook auth
	router.get('/auth/facebook', controllers.facebook.auth);
	router.get('/auth/facebook/return', controllers.facebook.authReturn);


	// http
	server.listen(app.get('port'), function () {
		console.log('Server listening at port %d', app.get('port'));
	});

	//https
	if(secureServer) {
		secureServer.listen(app.get('https'), function () {
			console.log('Secure server listening at port %d', app.get('https'));
		});
	}
}

module.exports = {
    configure: configure,
    start: start
}