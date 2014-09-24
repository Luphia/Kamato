var Result = require('../Objects/Result.js');
if(!String.prototype.startsWith) {
	Object.defineProperty(String.prototype, 'startsWith', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function(_text, _position) {
			_position = _position || 0;
			return this.lastIndexOf(_text, _position) === _position;
		}
	});
}

module.exports = {
	oauth2: function(_req, _res, _next) {
		if(_req.originalUrl == '/oauth/token') {
			_req.headers['content-type'] = 'application/x-www-form-urlencoded';
			_req.body['grant_type'] = 'password';
			_req.body['client_id'] = 'NCKU';
			_req.body['client_secret'] = "Cwn8zXw5";

			if(!_req.body.username) {
				_req.body.username = _req.body.account;
			}

			for(var key in _req.params) {
				!_req.body[key] && (_req.body[key] = _req.params[key]);
			}
		}
		else if(_req.originalUrl.startsWith('/oauth/renew/')) {
			_req.headers['content-type'] = 'application/x-www-form-urlencoded';
			_req.body['grant_type'] = 'refresh_token';
			_req.body['client_id'] = 'NCKU';
			_req.body['client_secret'] = "Cwn8zXw5";
			_req.body['refresh_token'] = _req.params.token;
		}

		_next();
	},
	errResponse: function(_err, _req, _res, _next) {
		if(!_res.result) { _res.result = new Result(); }
		_res.result.setMessage(_err.message);
		_res.jsonp(_res.result.toJSON());
	},
	response: function(_req, _res, _next) {
		if(!_res.result) { _res.result = new Result(); }
		_res.jsonp(_res.result.toJSON());
	}
};