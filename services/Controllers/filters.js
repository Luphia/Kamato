var Result = require('../Objects/Result.js'),
	querystring = require('querystring'),
	config;

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
	init: function(_config) {
		config = _config;
	},
	preprocessor: function(_req, _res, _next) {
		_res.header('X-Powered-By', config.version);
		if(_req.originalUrl == '/oauth/token') {
			module.exports.oauth2(_req, _res, _next, 'token');
		}
		else if(_req.originalUrl.startsWith('/oauth/renew/')) {
			module.exports.oauth2(_req, _res, _next, 'renew');
		}
		else {
			_next();
		}
	},
	oauth2: function(_req, _res, _next, _method) {
		switch(_method) {
			case 'token':
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
				break;

			case 'renew':
				_req.headers['content-type'] = 'application/x-www-form-urlencoded';
				_req.body['grant_type'] = 'refresh_token';
				_req.body['client_id'] = 'NCKU';
				_req.body['client_secret'] = "Cwn8zXw5";
				break;
		}

		_next();
	},
	errResponse: function(_err, _req, _res, _next) {
		if(!_res.result) { _res.result = new Result(); }

		/*
			400: no token
			401: invalid token
				The access token provided has expired.
				The access token provided is invalid.
		 */

		switch(_err.code) {
			case 400:
				_res.result.setResult(-1);
				break;
			case 401:
				if(_err.error_description == "The access token provided has expired.") {
					_res.result.setResult(-2);
				}
				else {
					_res.result.setResult(-1);
				}
				break;
		}

		_res.result.setMessage(_err.message);
		// _res.result.setData(_err);
		_res.jsonp(_res.result.toJSON());
	},
	response: function(_req, _res, _next) {
		console.log();
		if(!_res.result) {
			_res.status(404);
			return _res.render('error404', querystring.parse('path=' + _req.originalUrl.substr(1)));
		}
		_res.jsonp(_res.result.toJSON());
	}
};