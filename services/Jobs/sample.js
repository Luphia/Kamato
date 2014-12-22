var util = require('util')
,	Job = require('../Classes/Job.js');


var Sample = function(config, callback) {
	this.config = config;
	this.setCallback(callback);
};

Sample.prototype.work = function() {
	// do job

	// after jo finished
	this.done();
};


Sample.prototype = new Job();
module.exports = Sample;