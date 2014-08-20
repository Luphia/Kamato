var express = require('express'),
	path = require('path'),
	session = require('express-session'),
	RedisStore = require('connect-redis')(session),
	bodyParser = require('body-parser'),
	oauthserver = require('oauth2-server'),
	methodOverride = require('method-override');

var config,
	app,
	server,
	oauth,
	log4js,
	logger,
	controllers;

var configure = function (_config, _app, _server, _oauth, _log4js, _logger) {
	config = _config;
	app = _app;
	server = _server;
	oauth = _oauth;
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
		grants: ['password'],
		debug: true
	});

	app.set('port', config.get('server').port);
	app.set('view engine', 'jade');
	app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO, format: ':method :url' }));

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

	app.use(methodOverride('X-HTTP-Method-Override'));
	app.use(express.static(path.join(__dirname, '../public')));

	app.use(app.oauth.errorHandler());

	//Routes
	app.all('/oauth/token', app.oauth.grant());
	app.get('/public/:filename', controllers.google.file);
	app.get('/secret/*', app.oauth.authorise(), function (req, res) {
		res.send('Secret area');
	});

	server.listen(app.get('port'), function () {
		console.log('Server listening at port %d', app.get('port'));
	});
}

module.exports = {
    configure: configure,
    start: start
}