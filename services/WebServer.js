var express = require('express'),
	favicon = require('serve-favicon'),
	fs = require('fs'),
	path = require('path'),
	session = require('express-session'),
	RedisStore = require('connect-redis')(session),
	bodyParser = require('body-parser'),
	oauthserver = require('oauth2-server'),
	methodOverride = require('method-override'),
	Result = require('./Objects/Result.js'),
	Token = require('./Objects/Token.js');

var config,
	app,
	server,
	secureServer,
	oauth,
	log4js,
	logger,
	controllers,
	ssl,
	operator;

var configure = function (_config, _app, _server, _secureServer, _oauth, _log4js, _logger) {
	config = _config;
	app = _app;
	server = _server;
	secureServer = _secureServer;
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
		grants: ['password', 'refresh_token'],
		debug: false
	});
	operator = app.oauth.grant();

	app.set('port', config.get('server').port);
	app.set('https', config.get('server').https);
	app.set('view engine', 'jade');
	app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO, format: ':method :url' }));

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

	app.use(methodOverride('X-HTTP-Method-Override'));
	app.use(express.static(path.join(__dirname, '../public')));
	app.use(favicon(path.join('public/res/favicon.ico')));

	app.use(controllers.filters.oauth2);

	var router = express.Router();
	app.use(router);
	//app.use(app.oauth.errorHandler());
	app.use(controllers.filters.errResponse);
	app.use(controllers.filters.response);

	//Routes
	router.post('/oauth/token', function(_req, _res, _next) {
		_res.result = new Result();

		var myResponse = {
			jsonp: function(_data) {
				var myToken;
				var getToken = function(_err, _accessToken, _refreshToken) {
					if(_err) {
						_res.result.setMessage('authentication failed');
					}
					else {
						_res.result.setResult(1);
						_res.result.setMessage('authentication succeeded');
						myToken = new Token(_accessToken, _refreshToken);

						_res.result.setData(myToken.toJSON(1));
					}
					
					_next();
				};
				oauth.getTokenData(_data["access_token"], _data["refresh_token"], getToken);

			}
		};

		operator(_req, myResponse, _next);
	});
	router.get('/oauth/token/:token', function(_req, _res, _next) {
		_res.result = new Result();
		oauth.getAccessToken(_req.params.token, function(_err, _data) {
			if(_err) {
				_res.result.setMessage('authentication failed');
			}
			else {
				var myToken = new Token(_data);
				if(_data) {
					if(new Date() < new Date(myToken.data['accessExpire'])) {
						_res.result.setResult(1);
						_res.result.setMessage('valid token');
						_res.result.setData(myToken.toJSON());
					}
					else {
						_res.result.setResult(-2);
						_res.result.setMessage('expired token');
						_res.result.setData(myToken);
					}
				}
				else {
					_res.result.setResult(-1);
					_res.result.setMessage('invalid token');
				}				
			}

			_next();
		});
	});
	router.delete('/oauth/token/:token', function(_req, _res, _next) {
		_res.result = new Result();
		oauth.getAccessToken(_req.params.token, function(_err, _data) {

			_res.result.setData(_data);
			_next();
		});
	});
	router.get('/oauth/renew/:token', function(_req, _res, _next) {
		_res.result = new Result();

		var myResponse = {
			jsonp: function(_data) {
				_res.result.setData(_data);
				_next();
			}
		};

		_req.body['refresh_token'] = _req.params.token;
		_req.method = 'POST';
		_req.is = function() { return true; }

		operator(_req, _res, _next);
	});


	router.all('/oauth2/*', controllers.oauth2.callback);
	router.get('/public/*', controllers.google.file);
	router.get('/secret/*', app.oauth.authorise(), function (req, res) {
		res.send('Secret area');
	});

	// easyDB
	router.all('/db/', app.oauth.authorise(), controllers.easyDB.route);
	router.all('/db/:table', app.oauth.authorise(), controllers.easyDB.route);
	router.all('/db/:table/:id', app.oauth.authorise(), controllers.easyDB.route);

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