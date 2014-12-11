var _ = require('lodash'),
	fs = require('fs'),
	path = require('path');

var config;
var program;
var overrides =  false;

var initialize = function (configPath) {
	if (configPath) {
		configPath = configPath.indexOf('/') === 0 ? configPath : path.join(process.cwd(), configPath);
		if (!fs.existsSync(configPath)) {
			console.log('The configuration file doesn\'t exist.');
			return program.outputHelp();
		}
	}
	else {
		if (!fs.existsSync(configPath)) {
			console.log('You must provide a configuration file.');
			return program.outputHelp();
		}
	}

    return config = _.merge({}, require(configPath), overrides);
};

var get = function (key) {
    return config[key];
};
var set = function(key, data) {
	if(!config[key]) {
		return config[key] = data;
	}
	else {
		return false;
	}
};

module.exports = function(_program) {
	program = _program;
	var self = {
		initialize: initialize,
		get: get,
		set: set
	}

	return self;
}