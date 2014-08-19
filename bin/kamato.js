#!/usr/bin/env node

/*
	load config
	start service
 */

var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	log4js = require('log4js'),
	pack = require('../package'),
	program = require('commander'),
	fs = require('fs'),
	path = require('path'),
	config = require('../services/ConfigLoader.js')(program),
	web = require('../services/WebServer.js'),
	socket = require('../services/SocketServer.js'),
	push = require('../services/PushServer.js'),
	oauth = require('../services/OAuthServer.js'),
	twitter = require('../services/TwitterMonitor.js');

program.version(pack.version)
	.option("-c --config <configPath>", "Path to config file")
	.parse(process.argv);

var configPath = program.config || './config';
config.initialize(configPath);

log4js.configure(config.get('log4js'));
var logger = log4js.getLogger('Kamato.INFO');
logger.setLevel('INFO');

web.configure(config, app, server, oauth, log4js, logger);
socket.configure(config, server, logger);
push.configure(config, logger);
twitter.configure(config, logger);

socket.start();
//twitter.start();
web.start();