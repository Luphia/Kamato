module.exports = {
	oauth2: function(_req, _res, _next) {
		if(_req.originalUrl != '/oauth/token') return _next();

		_req.headers['content-type'] = 'application/x-www-form-urlencoded';
		_req.body['grant_type'] = 'password';
		_req.body['client_id'] = 'NCKU';
		_req.body['client_secret'] = "Cwn8zXw5";

		for(var key in _req.params) {
			!_req.body[key] && (_req.body[key] = _req.params[key]);
		}

		_next();
	}
};