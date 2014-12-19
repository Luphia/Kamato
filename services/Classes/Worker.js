module.exports = function(jobs, done) {
	var init = function(_jobs, _done) {
		this.jobs = [];
		this.finish = 0;
		this.active = false;
		if(typeof(_done) == 'function') {
			this.done = _done;
		}
		else {
			this.done = function() {}
		}

		return this;
	}
	,	work = function() {
		if(!this.active) {
			this.active = true;

		}

		return this;
	}
	,	addJob = function(job) {
		this.jobs.push(job);
		return this;
	}
	,	setPeriod = function(time) {
		this.period = time;
		return this;
	}
	,	setCallback = function(callback) {
		this.callback = callback;
		return this;
	}
	,	getStatus = function() {
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


		return this;
	}
	,	start = function() {
		this.active = true;
		work();
		return this;
	}
	,	stop = function() {
		this.active = true;
		return this;
	};

	var worker = {
		init: init,
		addJob: addJob,
		setPeriod: setPeriod,
		setCallback: setCallback,
		getStatus: getStatus,
		start: start,
		stop: stop,
		work: work,
		done: done
	};

	return worker.init(jobs, done);
}