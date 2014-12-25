var Job = function() {

};

Job.prototype.options = function() {
	this.config = config
};

Job.prototype.setCallback = function(callback) {
	if(typeof(callback) == 'function') {
		this.done = callback;
	}
};

Job.prototype.setTimeout = function() {};
Job.prototype.start = function(data) { this.work(data); };
Job.prototype.work = function(callback) { console.log('prototype work'); callback(); };
Job.prototype.done = function() { console.log('prototype done'); };

module.exports = Job;