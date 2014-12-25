/*

var Job = require('./services/Jobs/Collector.js');
var Worker = require('./services/Classes/Worker.js');

var w = new Worker();
w.setCallback(function(data) { console.log(data); });
w.setPeriod(5000);
w.addJob(Job, {}).addJob(Job, {}).start();

 */

var clone = function(target) {
	if(typeof(target) == 'object') {
		var rs = Array.isArray(target)? []: {};
		for(var key in target) {
			rs[key] = clone(target[key]);
		}
		return rs;
	}
	else {
		return target;
	}
};

var Worker = function(option) {
	this.init(option);
};


Worker.prototype.init = function(option) {
	this.option = option;
	this.jobs = [];
	this.jobOption = [];
	this.jobStatus = [];
	this.jobResult = [];
	this.idle = true;
	return this;
};

Worker.prototype.setCallback = function(callback) {
	if(typeof(callback) == 'function') {
		this.callback = callback;
	}
	return this;
};

Worker.prototype.addJob = function(job, option) {
	this.jobs.push(job);
	this.jobOption.push(option);
	this.jobStatus.push(false);
	this.jobResult.push(false);
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
	if(this.idle) {
		this.idle = false;

		for(var key in this.jobs) {
			if(!this.jobStatus[key]) {
				this.work(key);
			}
		}
	}

	return this;
};

Worker.prototype.work = function(jobNumber) {
	var that = this
	,	option = this.jobOption[jobNumber]
	,	callback = function(result) {
			that.done(jobNumber, result);
		}
	,	job = new this.jobs[jobNumber](option, callback)
	;

	//++ initial Job Status
	var status = {
			"inAction": true, 
			"isFinish": false
		};

	this.jobStatus[jobNumber] = status;
	job.start(this.getJobData());
};

Worker.prototype.getJobData = function() {
	return {
		"status": clone(this.jobStatus),
		"result": clone(this.jobResult)
	}
}

Worker.prototype.stop = function() {
	this.idle = true;
	clearTimeout(this.countdown);

	return this;
};

Worker.prototype.done = function(jobNumber, result) {
	//++ set Job Status
	this.jobStatus[jobNumber] = {
		"inAction": false, 
		"isFinish": true
	};
	this.jobResult[jobNumber] = result;

	console.log('Worker done');

	for(var k in this.jobStatus) {
		if(!this.jobStatus[k].isFinish) {
			return this;
		}
	}

	this.finish();
	return this;
};

Worker.prototype.reset = function() {
	this.jobStatus = [];
	this.jobResult = [];
	this.stop();
	for(var k in this.jobs) {
		this.jobStatus.push(false);
		this.jobResult.push(false);
	}
};

Worker.prototype.restart = function() {
	this.reset();
	this.start();
};

Worker.prototype.finish = function() {
	console.log('Worker finish');
	this.callback(clone(this.jobResult));
	this.idle = true;

	if(this.period > 0) {
		var self = this;
		this.countdown = setTimeout(function() {
			self.restart();
		}, this.period);
	}

	return this;
};


module.exports = Worker;