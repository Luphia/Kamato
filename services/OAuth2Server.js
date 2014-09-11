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

var OAuthRefreshTokensSchema = new Schema({
	refreshToken: { type: String },
	clientId: { type: String },
	userId: { type: String },
	expires: { type: Date }
});

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

mongoose.model('OAuthAccessTokens', OAuthAccessTokensSchema);
mongoose.model('OAuthRefreshTokens', OAuthRefreshTokensSchema);
mongoose.model('OAuthClients', OAuthClientsSchema);
mongoose.model('OAuthUsers', OAuthUsersSchema);

var OAuthAccessTokensModel = mongoose.model('OAuthAccessTokens'),
	OAuthRefreshTokensModel = mongoose.model('OAuthRefreshTokens'),
	OAuthClientsModel = mongoose.model('OAuthClients'),
	OAuthUsersModel = mongoose.model('OAuthUsers');


// initial auth data
model.configure = function(_config, _logger) {
	config = _config;
	logger = _logger;
	uristring = _config.get('mongo').uri + 'essyDB';
	db = mongoose.connect(uristring, function (err, res) {
		if (err) {
			console.log ('ERROR connecting to: ' + uristring + '. ' + err);
		} else {
			console.log ('Succeeded connected to: ' + uristring);
			var myUser = new OAuthUsersModel({
				username: 'Tommy',
				password: 'pTommy',
				firstname: 'Tommy',
				lastname: 'Febre',
				email: 'tommy@iii.org.tw'
			});
			myUser.save(function (err) {
				if (err) console.log(err);
			});
			var myClient = new OAuthClientsModel({
				clientId: 'Babu',
				clientSecret: 'pBabu',
				redirectUri: ''
			});
			myClient.save(function (err) {
				if (err) console.log(err);
			});

			var nckuUser = new OAuthUsersModel({
				username: 'ncku',
				password: 'o3jvGKUK',
				firstname: 'Tommy',
				lastname: 'Febre',
				email: 'tommy@iii.org.tw'
			});
			var nckuClient = new OAuthClientsModel({
				clientId: 'NCKU',
				clientSecret: 'Cwn8zXw5',
				redirectUri: ''
			});
			nckuUser.save(function (err) {
				if (err) console.log(err);
			});
			nckuClient.save(function (err) {
				if (err) console.log(err);
			});
		}
	});
};

// oauth2-server callbacks
model.getAccessToken = function (bearerToken, callback) {
	console.log('in getAccessToken (bearerToken: ' + bearerToken + ')');

	OAuthAccessTokensModel.findOne({ accessToken: bearerToken }, callback);
};

model.getClient = function (clientId, clientSecret, callback) {
	console.log('in getClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ')');
	if (clientSecret === null) {
		return OAuthClientsModel.findOne({ clientId: clientId }, callback);
	}
	OAuthClientsModel.findOne({ clientId: clientId, clientSecret: clientSecret }, callback);
};

// This will very much depend on your setup, I wouldn't advise doing anything exactly like this but
// it gives an example of how to use the method to resrict certain grant types

model.grantTypeAllowed = function (clientId, grantType, callback) {
	console.log('in grantTypeAllowed (clientId: ' + clientId + ', grantType: ' + grantType + ')');

	if (grantType === 'password') {
		return callback(false, true);
	}

	callback(false, true);
};

model.saveAccessToken = function (token, clientId, expires, userId, callback) {
	console.log('in saveAccessToken (token: ' + token + ', clientId: ' + clientId + ', userId: ' + userId + ', expires: ' + expires + ')');

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
	console.log('in getUser (username: ' + username + ', password: ' + password + ')');

	OAuthUsersModel.findOne({ username: username, password: password }, function(err, user) {
		if(err) {
			return callback(err);
		}
		callback(null, user._id);
	});
};

/*
* Required to support refreshToken grant type
*/
model.saveRefreshToken = function (token, clientId, expires, userId, callback) {
	console.log('in saveRefreshToken (token: ' + token + ', clientId: ' + clientId +', userId: ' + userId + ', expires: ' + expires + ')');

	var refreshToken = new OAuthRefreshTokensModel({
		refreshToken: token,
		clientId: clientId,
		userId: userId,
		expires: expires
	});

	refreshToken.save(callback);
};

model.getRefreshToken = function (refreshToken, callback) {
	console.log('in getRefreshToken (refreshToken: ' + refreshToken + ')');

	OAuthRefreshTokensModel.findOne({ refreshToken: refreshToken }, callback);
};