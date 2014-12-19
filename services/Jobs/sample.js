var util = require('util')
,	Job = require('../Classes/Job.js');


var Sample = function() {

	var work = function() {
		this.done();
	}
	,	sample = {
		work: work
	};
	Job.call(sample);
	return sample;
};

util.inherits(Sample, Job);
//Sample.prototype = new Job();
module.exports = Sample;