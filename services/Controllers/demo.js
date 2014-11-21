/*
	userprofile = {
		account
		password
		google
		facebook
		fitbit
		nike
		jawbone
		runkeeper
	}
 */

var Result = require('../Classes/Result.js');

var config,
	logger;

var uiDashboard = function(req, res) {
		res.render('dashboard.html', req.params);
	},
	uiChallenge = function(req, res) {
		res.render('challenge.html', req.params);
	},
	getDashboard = function(req, res, next) {
		res.result = new Result();
		var data = {
			"profile": {
				"height": {
					"value": 174,
					"unit": "cm"
				},
				"weight": {
					"value": 64,
					"unit": "kg"
				},
				"bodyfat": {
					"value": 16.3,
					"unit": "%"
				},
				"birth": "1984-11-11"
			},
			"activities": {
				"exercise": {
					"standard": 1000,
					"current": 780
				},
				"sleep": {
					"standard": 800,
					"current": 350
				},
				"calories": {
					"standard": 2000,
					"current": 2485
				}
			},
			"physiological": {
				"heartbeat": [
					90, 104, 97, 83, 116, 78,
					100, 105, 113, 115, 77, 89,
					114, 122, 62, 116, 117, 128,
					101, 77, 70, 76, 62, 128,
					114, 104, 71, 125, 126, 94,
					81, 98, 61, 122, 77, 78,
					70, 94, 68, 66, 81, 99,
					79, 67, 74, 117, 128, 78,
					79, 116, 83, 72, 121, 105,
					70, 126, 97, 79, 120, 109,
					81, 119, 85, 107, 121, 120,
					63, 71, 95, 91, 120, 75,
					90, 102, 117, 80, 79, 82,
					109, 92, 120, 86, 73, 98,
					60, 114, 62, 73, 73, 62,
					109, 81, 72, 61, 85, 68,
					71, 92, 77,	125, 92, 97,
					111, 115, 78, 110, 63, 79,
					86, 113, 61, 65, 110, 80,
					64, 81, 87, 86, 111, 121,
					129, 81, 114, 68, 112, 65,
					100, 111, 66, 114, 87, 109,
					109, 71, 109, 125, 64, 94,
					84, 74, 69, 71, 118, 124
				],
				"weight": [
					1.2, -1.4, -0.4, 0.3, -0.3, 1.6, 0.6, 0.1, 0.3, 1.4,
					-1.3, -1.3, 1.4, -0.8, 1.7, 1.6, -0.9, 0.1, 1.6, 0.3,
					-1.1, 1.4, -1.7, 0.6, 0.2, 1, 2, 1.5, 0.3, -1.9
				]
			}
		};
		res.result.response(next, 1, 'get dashboard data', data);
	},
	getChallenge = function(req, res, next) {
		res.result = new Result();
		var data = {
			"record": {
				"rank": 4,
				"time": {
					"value": 44.2,
					"unit": "hr",
					"rank": 7
				},
				"calories": {
					"value": 6392,
					"unit": "kcal",
					"rank": 3
				},
				"distance": {
					"value": 142.4,
					"unit": "km",
					"rank": 4
				}
			},
			"challenge": [
				{
					"type": "distance",
					"target": {
						"value": 50,
						"unit": "km"
					},
					"during": ["2014-11-01T00:00:00Z", "2014-11-30T00:00:00Z"],
					"Participants": 24,
					"rank": 4,
					"start": true,
					"end": false,
					"finish": false,
					"progress": 64.3
				},
				{
					"type": "calories",
					"target": {
						"value": 5000,
						"unit": "kcal"
					},
					"during": ["2014-10-15T00:00:00Z", "2014-10-30T00:00:00Z"],
					"Participants": 8,
					"rank": 2,
					"start": true,
					"end": true,
					"finish": "2014-10-27T22:18:46Z",
					"progress": 100
				},
				{
					"type": "time",
					"target": {
						"value": 20,
						"unit": "hr"
					},
					"during": ["2014-10-01T00:00:00Z", "2014-10-10T00:00:00Z"],
					"Participants": 18,
					"rank": 13,
					"start": true,
					"end": true,
					"finish": false,
					"progress": 82.4
				}
			]
		};
		res.result.response(next, 1, 'get challenge data', data);
	},
	init = function(_config, _logger, route) {
		config = _config;
		logger = _logger;

		route.get('/ui/dashboard/:uid', uiDashboard);
		route.get('/ui/challenge/:uid', uiChallenge);
		route.get('/ui/dashboard/:uid/json', getDashboard);
		route.get('/ui/challenge/:uid/json', getChallenge);
	};

module.exports = {
	init: init
};