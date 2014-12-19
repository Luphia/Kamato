var Job = function() {
	this.work = function() { console.log('prototype work'); };
	this.done = function() { console.log('prototype done'); };
};

Job.prototype.options = function() {
	this.config = config
};

Job.prototype.setCallback = function(callback) {
	if(typeof(callback) == 'function') {
		this.done = callback;
	}
};

Job.prototype.setTimeout = function() {
	
};

Job.prototype.start = function() {
	this.work();
};

module.exports = Job;