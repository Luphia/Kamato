var util = require('util')
,	Job = require('../Classes/Job.js');


var Sample = function(config, callback) {
	this.config = config;
	this.setCallback(callback);
};

Sample.prototype = new Job();
Sample.prototype.work = function() {
	// do job
	console.log('%s do sample job', new Date());

	// after jo finished
	this.done();
};

module.exports = Sample;