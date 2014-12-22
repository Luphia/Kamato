/*

var Job = require('./services/Classes/Job.js');
var Job = require('./services/Jobs/sample.js');
var Worker = require('./services/Classes/Worker.js');

 */

var Worker = function(option) {
	this.option = option;
	this.jobs = [];
	this.done = [];
	this.finish = 0;
	this.active = false;
};


Worker.prototype.init = function(option) {
	this.option = option;
	return this;
};

Worker.prototype.setCallback = function(callback) {
	if(typeof(callback) == 'function') {
		this.finish = callback;
	}
	return this;
};

Worker.prototype.addJob = function(job) {
	this.jobs.push(job);
	this.jobStatus.push(false);
	return this;
};

Worker.prototype.setPeriod = function(period) {
	this.period = parseInt(period);
	return this;
};

Worker.prototype.getStatus = function() {
	/*
		{
			done:
			jobs:
			finish:
			progress:
			active:
			logs:
			error:
		}
	 */

};

Worker.prototype.start = function() {
	if(!this.active) {
		this.active = true;

		for(var key in this.jobs) {
			if(!this.jobStatus[key]) {
				this.work[key];
			}
		}
	}

	return this;
};

Worker.prototype.work = function(jobNumber) {
	var job = this.jobs[jobNumber]
	,	callback = function() {
			this.done(jobNumber);
		}
	;

	var status = {
			"inAction": true, 
			"isFinish": false
		};

	this.jobStatus[jobNumber] = status;

	job.setCallback(callback);
	job.start();
};

Worker.prototype.stop = function() {

	return this;
};

Worker.prototype.done = function(jobNumber) {
	console.log('Worker done');
	return this;
};

Worker.prototype.finish = function() {
	console.log('Worker finish');
	return this;
};



module.exports = Worker;