module.exports = function() {
	var work = function() {

	}
	,	done = function(job) {

	}
	,	init = function() {
		this.jobs = [];
		this.finish = 0;
		this.active = false;
		this.done = function(err, data) {

		};
		return this;
	}
	,	addJob = function(job) {
		this.jobs.push(job);
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
		setCallback: setCallback,
		getStatus: getStatus,
		start: start,
		stop: stop
	};

	return worker.init();
}