var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	model = module.exports;

// Schemas definitions
var OAuthAccessTokensSchema = new Schema({
	accessToken: { type: String },
	clientId: { type: String },
	userId: { type: String },
	expires: { type: Date }
});
OAuthAccessTokensSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
	return this.collection.findAndModify(query, sort, doc, options, callback);
};

var OAuthRefreshTokensSchema = new Schema({
	refreshToken: { type: String },
	accessToken: { type: String },
	clientId: { type: String },
	userId: { type: String },
	expires: { type: Date }
});
OAuthRefreshTokensSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
	return this.collection.findAndModify(query, sort, doc, options, callback);
};

var OAuthClientsSchema = new Schema({
	clientId: { type: String },
	clientSecret: { type: String },
	redirectUri: { type: String }
});

var OAuthUsersSchema = new Schema({
	username: { type: String },
	password: { type: String },
	firstname: { type: String },
	lastname: { type: String },
	email: { type: String, default: '' }
});

mongoose.model('OAuthAccessTokens', OAuthAccessTokensSchema, 'OAuthAccessTokens');
mongoose.model('OAuthRefreshTokens', OAuthRefreshTokensSchema, 'OAuthRefreshTokens');
mongoose.model('OAuthClients', OAuthClientsSchema, 'OAuthClients');
mongoose.model('OAuthUsers', OAuthUsersSchema, 'OAuthUsers');

var OAuthAccessTokensModel = mongoose.model('OAuthAccessTokens'),
	OAuthRefreshTokensModel = mongoose.model('OAuthRefreshTokens'),
	OAuthClientsModel = mongoose.model('OAuthClients'),
	OAuthUsersModel = mongoose.model('OAuthUsers');


// initial auth data
model.configure = function(_config, _logger) {
	config = _config;
	logger = _logger;
	uristring = _config.get('mongo').uri + 'OAuth2';
	db = mongoose.connect(uristring, function (err, res) {
		if (err) {
			logger.exception.error('ERROR connecting to: ' + uristring + '. ' + err);
		} else {
			logger.info.info('Succeeded connected to: ' + uristring);
			var myUser = {
					username: 'ncku',
					password: 'o3jvGKUK',
					firstname: 'Tommy',
					lastname: 'Febre',
					email: 'tommy@iii.org.tw'
				},
				myClient = {
					clientId: 'NCKU',
					clientSecret: 'Cwn8zXw5',
					redirectUri: ''
				};

			OAuthUsersModel.count(myUser, function(_err, _count) {
				if(_err || _count == 0) {
					var nckuUser = new OAuthUsersModel(myUser);
					nckuUser.save(function(err) { logger.exception.error(err); });

					logger.info.info("Add Default User");
				}
			});

			OAuthUsersModel.count(myUser, function(_err, _count) {
				if(_err || _count == 0) {
					var nckuClient = new OAuthClientsModel(myClient);
					nckuClient.save(function(err) { logger.exception.error(err); });

					logger.info.info("Add Default Client");
				}
			});
		}
	});
};

model.getTokenData = function(_accessToken, _refreshToken, _callback) {
	var doing = 2,
		accessToken,
		refreshToken;

	var callback = function(err, data) {
		doing --;

		data && data.accessToken && (accessToken = data);
		data && data.refreshToken && (refreshToken = data);

		if(doing <= 0) {
			if(accessToken && refreshToken) {
				_callback(false, accessToken, refreshToken);
			}
			else {
				_callback(true);
			}
		}
	}
	OAuthAccessTokensModel.findOne({ accessToken: _accessToken }, callback);
	OAuthRefreshTokensModel.findOne({ refreshToken: _refreshToken }, callback);
};

// oauth2-server callbacks
model.getAccessToken = function (bearerToken, callback) {
	//console.log('in getAccessToken (bearerToken: ' + bearerToken + ')');

	OAuthAccessTokensModel.findOne({ accessToken: bearerToken }, callback);
};

model.destroyToken = function (bearerToken, callback) {
	OAuthAccessTokensModel.findAndModify(
		{ accessToken: bearerToken },
		[],
		{$set: {"expires": new Date()}},
		{},
		callback
	);
};

model.getClient = function (clientId, clientSecret, callback) {
	//console.log('in getClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ')');
	if (clientSecret === null) {
		return OAuthClientsModel.findOne({ clientId: clientId }, callback);
	}
	OAuthClientsModel.findOne({ clientId: clientId, clientSecret: clientSecret }, callback);
};

// This will very much depend on your setup, I wouldn't advise doing anything exactly like this but
// it gives an example of how to use the method to resrict certain grant types

model.grantTypeAllowed = function (clientId, grantType, callback) {
	//console.log('in grantTypeAllowed (clientId: ' + clientId + ', grantType: ' + grantType + ')');

	if (grantType === 'password') {
		return callback(false, true);
	}

	callback(false, true);
};

model.saveAccessToken = function (token, clientId, expires, userId, callback) {
	//console.log('in saveAccessToken (token: ' + token + ', clientId: ' + clientId + ', userId: ' + userId + ', expires: ' + expires + ')');

	var accessToken = new OAuthAccessTokensModel({
		accessToken: token,
		clientId: clientId,
		userId: userId,
		expires: expires
	});

	accessToken.save(callback);
};

/*
* Required to support password grant type
*/
model.getUser = function (username, password, callback) {
	//console.log('in getUser (username: ' + username + ', password: ' + password + ')');

	OAuthUsersModel.findOne({ username: username, password: password }, function(err, user) {
		if(err) {
			return callback(err);
		}
		if(!user) {
			user = {};
		}
		callback(null, user._id);
	});
};

/*
* Required to support refreshToken grant type
*/
model.saveRefreshToken = function (token, clientId, expires, userId, callback) {
	//console.log('in saveRefreshToken (token: ' + token + ', clientId: ' + clientId +', userId: ' + userId + ', expires: ' + expires + ')');

	var refreshToken = new OAuthRefreshTokensModel({
		refreshToken: token,
		clientId: clientId,
		userId: userId,
		expires: expires
	});

	refreshToken.save(callback);
};

model.getRefreshToken = function (refreshToken, callback) {
	//console.log('in getRefreshToken (refreshToken: ' + refreshToken + ')');

	OAuthRefreshTokensModel.findAndModify(
		{ refreshToken: refreshToken },
		[],
		{$set: {"expires": new Date()}},
		{},
		callback
	);
};