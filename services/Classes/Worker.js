/*

var Job = require('./services/Jobs/sample.js');
var Worker = require('./services/Classes/Worker.js');

var w = new Worker();
var j = new Job();
w.addJob(j).start();

 */

var Worker = function(option) {
	this.init(option);
	this.jobs = [];
	this.jobStatus = [];
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
				this.work(key);
			}
		}
	}

	return this;
};

Worker.prototype.work = function(jobNumber) {
	var job = this.jobs[jobNumber]
	,	that = this
	,	callback = function() {
			that.done(jobNumber);
		}
	;

	//++ initial Job Status
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
	//++ set Job Status
	this.jobStatus[jobNumber] = {
		"inAction": false, 
		"isFinish": true
	};

	console.log('Worker done');
	return this;
};

Worker.prototype.reset = function() {
	this.jobStatus = [];
	for(var k in this.jobs) {
		this.jobStatus.push(false);
	}
};

Worker.prototype.finish = function() {
	console.log('Worker finish');
	return this;
};


module.exports = Worker;