
module.exports = function(_accessToken, _refreshToken) {
	var _init = function(_access, _refresh) {
		if(!_access) {
			var _access = {};
		}
		if(!_refresh) {
			var _refresh = {};
			_refresh.expires = new Date(new Date(_access.expires) / 1 + 86400000 - 3600000).toJSON();
		}


		this.data = {
			"client": "",
			"user": "",
			"tokenType": "bearer",
			"accessToken": "",
			"refreshToken": "",
			"accessExpire": 0,
			"refreshExpire": 0
		};

		_access.accessToken && (this.data.accessToken = _access.accessToken);
		_access.clientId && (this.data.client = _access.clientId);
		_access.expires && (this.data.accessExpire = new Date(_access.expires) / 1);

		_refresh.refreshToken && (this.data.refreshToken = _refresh.refreshToken);
		_refresh.clientId && (this.data.client = _refresh.clientId);
		_refresh.expires && (this.data.refreshExpire = new Date(_refresh.expires) / 1);

		return this;
	}

	/* detail 
		0: tokenType, accessToken, accessExpire, refreshExpire 
		1: tokenType, accessToken, refreshToken, accessExpire, refreshExpire
	 */
	, toJSON = function(_detail) {
		_detail = _detail || 0;
		var json = {};

		switch(_detail) {
			case 1:
				json["access_token"] = this.data.accessToken;
				json["refresh_token"] = this.data.refreshToken;
			case 0:
				json["token_type"] = this.data.tokenType;
				json["access_expire"] = this.data.accessExpire;
				json["refresh_expire"] = this.data.refreshExpire;
			default:
				break;
		}

		return json;
	}

	, that = {
		_init: _init,
		toJSON: toJSON
	};

	return that._init(_accessToken, _refreshToken);
}