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
	log4js,
	logger,
	controllers,
	ssl,
	operator,
	router;

var configure = function(_config, _app, _server, _secureServer, _oauth, _log4js, _logger) {
	config = _config;
	app = _app;
	server = _server;
	secureServer = _secureServer;
	oauth = _oauth;
	log4js = _log4js;
	logger = _logger;
	router = express.Router();
	controllers = require('./Controllers')(config, _log4js);
};

var route = function(type, path, controller, auth) {
	var method;
	if(typeof path != 'string') { return false; }

	switch(type) {
		case 'all':
		case 'get':
		case 'post':
		case 'put':
		case 'delete':
			method = type;
			break;
		case 'del':
			method = 'delete';
		default:
			method = 'get';
			break;
	}

	if(auth) {
		router[method](path, app.oauth.authorise(), controller);
	}
	else {
		router[method](path, controller);
	}

	return true;
}

var start = function() {
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

	app.set('port', config.get('server').port);
	app.set('https', config.get('server').https);
	app.set('view engine', 'jade');

	app.use(log4js.connectLogger(logger.info, { level: log4js.levels.INFO }));
	//app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO, format: ':method :url' }));
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
	app.use(controllers.filters.preprocessor);

	app.use(methodOverride('X-HTTP-Method-Override'));
	app.use(express.static(path.join(__dirname, '../public')));
	app.use(favicon(path.join('public/res/favicon.ico')));

	app.use(router);
	app.use(controllers.filters.errResponse);
	app.use(controllers.filters.response);

	//Routes
	router.post('/oauth/token', controllers.oauth2.createToken);
	router.get('/oauth/token/:token', controllers.oauth2.checkToken);
	router.delete('/oauth/token/:token', controllers.oauth2.deleteToken);
	router.get('/oauth/renew/:token', controllers.oauth2.renewToken);

	router.all('/oauth2/*', controllers.oauth2.callback);
	router.get('/public/*', controllers.passport.file);
	router.get('/secret/*', app.oauth.authorise(), function (req, res) {
		res.send('Secret area');
	});

	// easyDB
	router.all('/db/', app.oauth.authorise(), controllers.easyDB.route);
	router.all('/db/:table', app.oauth.authorise(), controllers.easyDB.route);
	router.all('/db/:table/:id', app.oauth.authorise(), controllers.easyDB.route);

	// user data
	router.get('/me', controllers.user.data);
	router.post('/login', controllers.user.login);

	// OAuth2
	router.get('/oauth/:platform', controllers.passport.auth);
	router.get('/oauth/:platform/return', controllers.passport.authReturn);

	// DEMO APP
	router.get('/ui/dashboard/:uid', function(req, res, next) { res.render('demo_dashboard', req.params); });
	router.get('/ui/challenge/:uid', function(req, res, next) { res.render('demo_challenge', req.params); });

	// http
	server.listen(app.get('port'), function () {
		logger.info.info('Server listening at port %d', app.get('port'));
	});

	//https
	if(secureServer) {
		secureServer.listen(app.get('https'), function () {
			logger.info.info('Secure server listening at port %d', app.get('https'));
		});
	}
}

module.exports = {
    configure: configure,
    start: start,
    route: route
}