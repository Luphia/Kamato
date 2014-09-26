var config,
	oauth,
	operator,
	Result = require('../Objects/Result.js'),
	Token = require('../Objects/Token.js');

var setResult = function(result, next, _rs, _msg, _data) {
	_rs && result.setResult(_rs);
	_msg && result.setMessage(_msg);
	_data && result.setData(_data);
	next();
};

module.exports = {
	init: function(_config, _oauth, _operator) {
		_config && (config = _config);
		_oauth && (oauth = _oauth);
		_operator && (operator = _operator);
	},
	createToken: function(_req, _res, _next) {
		_res.result = new Result();

		var myResponse = {
			jsonp: function(_data) {
				var myToken;
				var getToken = function(_err, _accessToken, _refreshToken) {
					if(_err) {
						setResult(_res.result, _next, 0, 'authentication failed');
					}
					else {
						myToken = new Token(_accessToken, _refreshToken);
						setResult(_res.result, _next, 1, 'authentication succeeded', myToken.toJSON(1));
					}
				};
				oauth.getTokenData(_data["access_token"], _data["refresh_token"], getToken);
			}
		};

		operator(_req, myResponse, _next);
	},
	checkToken: function(_req, _res, _next) {
		_res.result = new Result();
		oauth.getAccessToken(_req.params.token, function(_err, _data) {
			if(_err) {
				setResult(_res.result, _next, 0, 'invalid token');
			}
			else {
				var myToken = new Token(_data);
				if(_data) {
					if(new Date() < new Date(myToken.data['accessExpire'])) {
						setResult(_res.result, _next, 1, 'valid token', myToken.toJSON());
					}
					else {
						setResult(_res.result, _next, -2, 'expired token');
					}
				}
				else {
					setResult(_res.result, _next, -1, 'invalid token');
				}				
			}
		});
	},
	deleteToken: function(_req, _res, _next) {
		_res.result = new Result();
		oauth.destroyToken(_req.params.token, function(_err, _data) {
			if(_err || _data.length == 0) {
				setResult(_res.result, _next, -1, 'invalid token');
			}
			else {
				setResult(_res.result, _next, 1, 'token destroy');
			}
		});
	},
	renewToken: function(_req, _res, _next) {
		_res.result = new Result();

		var myResponse = {
			jsonp: function(_data) {
				_res.result.setData(_data);
				_next();
			}
		};

		_req.body['refresh_token'] = _req.params.token;
		_req.method = 'POST';
		_req.is = function() { return true; }

		operator(_req, _res, _next);
	},
	callback: function(_req, _res) {
		var params = {
			uri: _req.query,
			post: _req.params
		};
		_res.send(params);
	}
};