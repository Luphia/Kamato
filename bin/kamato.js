#!/usr/bin/env node

/*
	load config
	start service
 */

var express = require('express'),
	Session = require('express-session'),
	RedisStore = require('connect-redis')(Session),
	app = express(),
	https = require('https'),
	server = require('http').createServer(app),
	secureServer,
	log4js = require('log4js'),
	pack = require('../package'),
	program = require('commander'),
	fs = require('fs'),
	path = require('path'),
	config = require('../services/ConfigLoader.js')(program),
	web = require('../services/WebServer.js'),
	socket = require('../services/SocketServer.js'),
	push = require('../services/PushServer.js'),
	oauth = require('../services/OAuth2Server.js'),
	twitter = require('../services/TwitterMonitor.js'),
	worker = require('../services/Classes/Worker.js'),
	ssl,
	session;

program.version(pack.version)
	.option("-c --config <configPath>", "Path to config file")
	.parse(process.argv);

var configPath = program.config || './config.private';
config.initialize(configPath);
config.path = configPath + '/';
config.version = pack.name + " ver." + pack.version;

(function(fullconfig) {
	var _config = fullconfig.get('ssl');
	_config.path = fullconfig.path;

	// check Key file & Certificate file
	if(fs.existsSync(_config.path + _config.key) && fs.existsSync(_config.path + _config.cert)) {
		ssl = {};
		_config.key && (ssl.key = fs.readFileSync(_config.path + _config.key));
		_config.cert && (ssl.cert = fs.readFileSync(_config.path + _config.cert));
		_config.ca && (ssl.ca = fs.readFileSync(_config.path + _config.ca));
		_config.requestCert && (ssl.requestCert = _config.requestCert);
		_config.rejectUnauthorized && (ssl.rejectUnauthorized = _config.rejectUnauthorized);
		_config.passphrase && (ssl.passphrase = _config.passphrase);
	}
	else {
		ssl = false;
	}
})(config);

session = Session({
	store: new RedisStore(config.get('redis')),
	secret: config.get('server').secret,
	resave: true,
	saveUninitialized: true
});

log4js.configure(config.get('log4js'));
var logger = {
	info: log4js.getLogger('Kamato.INFO'),
	exception: log4js.getLogger('Kamato.EXCEPTION'),
	hack: log4js.getLogger('Kamato.HACK')
};
logger.info.setLevel('INFO');
logger.exception.setLevel('ERROR');
logger.hack.setLevel('WARN');

// log for crash event
process.on('uncaughtException', function(err) {
	logger.exception.error(err);
});

ssl && (secureServer = https.createServer(ssl, app));

web.configure(config, app, server, secureServer, session, oauth, log4js, logger);
socket.configure(config, server, secureServer, session, logger, web.route);
push.configure(config, logger);
oauth.configure(config, logger);
twitter.configure(config, logger);

socket.start();
//twitter.start();
web.start();


// worker
/*
var jobOption = {
	config.get('mongo').uri;
var Job = require('./services/Jobs/Collector.js');
var woker = new Worker();
worker.setCallback(function(data) { console.log(data); });
worker.setPeriod(3600000);
w.addJob(Job, jobOption).addJob(Job, {}).start();
 */