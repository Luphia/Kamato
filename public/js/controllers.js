'use strict';

/* Controllers */
var KamatoControllers = angular.module('KamatoControllers', []);
KamatoControllers.controller('SummaryCtrl', ['$scope', '$http', function($scope, $http) {
	/*
	$http.get('./data/cases.json').success(function(data) {
		$scope.cases = data;
	});
	*/
}]);


KamatoControllers.controller('MapCtrl', ['$scope', '$http', function($scope, $http) {
	/* get location data */
	navigator.geolocation.getCurrentPosition(
		function (pos) {
			var crd = pos.coords;

			$scope.map = {
				center: {
					latitude: crd.latitude,
					longitude: crd.longitude
				},
				zoom: 14
			};

			console.log('Your current position is:');
			console.log('Latitude : ' + crd.latitude);
			console.log('Longitude: ' + crd.longitude);
			console.log('More or less ' + crd.accuracy + ' meters.');
		},
		function (err) {
			console.warn('ERROR(' + err.code + '): ' + err.message);
		},
		{
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0
		}
	);

	$scope.map = {
		center: {
			latitude: 0,
			longitude: 0
		},
		zoom: 5
	};


	var sqrt3 = Math.sqrt(3);
	$scope.size = 30;

	var Point =function() {
		var types = ["play", "play", "play", "play", ""];
		var type = types[Math.floor(Math.random()*types.length)];
		var randX = Math.floor(Math.random() * 20);
		var randY = Math.floor(Math.random() * 7);

		return {
			x: randX * $scope.size * 1.1 * 1.5,
			y: sqrt3 * (randX % 2 + randY * 2) / 2 * $scope.size * 1.1,
			l: 1,
			o: 10,
			type: type
		};
	};

	var exists = [];
	$scope.positions = [];

	var addChannel = function(render) {
		var point = new Point();
		var aPoint = point.x + "," + point.y;
		var aIndex = exists.indexOf(aPoint);

		if(aIndex > -1) {
			$scope.positions[aIndex].l ++;
			var mod6 = $scope.positions[aIndex].l % 6;
			var mod12 = $scope.positions[aIndex].l % 12;
			if(mod12 > 5) {
				$scope.positions[aIndex].o = mod6 * 10;
			}
			else {
				$scope.positions[aIndex].o = (5 - mod6) * 10;
			}
		}
		else {
			$scope.positions.push(point);
			exists.push(aPoint);
		}

		!render && $scope.$apply();
	};
	for(var i = 0; i < 100; i++) {
		addChannel(true);
	}
	setInterval(addChannel, 10);

	$scope.block = {
		width: $scope.size * 2,
		height: $scope.size * sqrt3
	}

	$scope.points = [
		{x: $scope.size * -0.5, y: $scope.size * 0.5 * sqrt3},
		{x: $scope.size * 0.5, y: $scope.size * 0.5 * sqrt3},
		{x: $scope.size * 1, y: $scope.size * 0},
		{x: $scope.size * 0.5, y: $scope.size * -0.5 * sqrt3},
		{x: $scope.size * -0.5, y: $scope.size * -0.5 * sqrt3},
		{x: $scope.size * -1, y: $scope.size * 0}
	];
}]);

KamatoControllers.controller('ChatCtrl', ['$scope', '$window', '$routeParams', '$http', '$location', '$anchorScroll', 'socket', function($scope, $window, $routeParams, $http, $location, $anchorScroll, $socket) {
	/* message type: log text link emotion image sound video */
	var COLORS = [
		'#e2aa99', '#ccbbaa', '#f8cc88', '#f7aa55',
		'#aadd88', '#78bb50', '#c8f095', '#7be8c4',
		'#6699cc', '#aa88dd', '#ccbbff', '#d3aae7'
	];

	$scope.initializeWindowSize = function() {
		$scope.windowHeight = $window.innerHeight;
		$scope.chatAreaHeight = $window.innerHeight - 60;
		$scope.inputAreawidth = $window.innerWidth - 20;
		return $scope.windowWidth = $window.innerWidth;
	};
	$scope.initializeWindowSize();
	angular.element($window).bind('resize', function() {
		$scope.initializeWindowSize();
		return $scope.$apply();
	});

	var getUsernameColor = function(username) {
		// Compute hash code
		!username && (username = '');
		var hash = 7;
		for (var i = 0; i < username.length; i++) {
			hash = username.charCodeAt(i) + (hash << 5) - hash;
		}
		// Calculate color
		var index = Math.abs(hash % COLORS.length);
		return COLORS[index];
	};

	var formatDate = function(d){
		var addZero = function(n){
			return n < 10 ? '0' + n : '' + n;
		}

		return d.getFullYear() +"/"+ addZero(d.getMonth()+1) + "/" + addZero(d.getDate()) + " " + addZero(d.getHours()) + ":" + addZero(d.getMinutes()) + ":" + addZero(d.getMinutes());
	};

	var processMessages = function(messages) {
		for(var k in messages) {
			messages[k] = processMessage(messages[k]);
		}
		return messages;
	};
	var processMessage = function(message) {
		if(!message.user) {
			message.user = {
				"name": message.username || ''
			};
		}

		if(message.user.image) {
			message.background = 'url(' + message.user.image + ')';
		}
		else {
			message.background = getUsernameColor(message.user.name);
		}
		message.textDate = formatDate(new Date(message.timestamp));
		return message;
	};
	var addMessage = function(message) {
		$scope.messages.push(processMessage(message));
	};
	var addLog = function(message) {
		message.type = 'log';
		$scope.messages.push(processMessage(message));
	};
	var prependMessage = function(message) {
		for(var k = $scope.messages.length; k > 0; k--) {
			$scope.messages[k] = $scope.messages[k - 1];
		}
		$scope.messages[0] = processMessage(message);
	};
	var sendMessage = function() {
		var text = $scope.newMessage;

		var message = {
			"user": {
				"name": "me",
				"me": true
			},
			"message": text,
			"timestamp": new Date()
		};

		$socket.emit('new message', text);
		addMessage(message);
		$scope.newMessage = '';
		gotoBottom();
	};
	var addChatTyping = function(data) {
		console.log(data);
	};
	var removeChatTyping = function(data) {
		console.log(data);
	};
	var gotoBottom = function() {
		$location.hash('roomEnd');
		$anchorScroll();
	};
	var stopTyping = function() {
		$socket.emit('stop typing');
	};
	var stopTypingEvent;
	var setStopTyping = function(time) {
		if(!(time && time > 0)) {
			time = 1000;
		}

		clearTimeout(stopTypingEvent);
		stopTypingEvent = setTimeout(stopTyping, time);
	}


	$scope.keyMessage = function(e) {
		if(e.keyCode == 13) {
			sendMessage();
		}
		else {
			$socket.emit('typing');
		}

		setStopTyping(500);
	}

	$scope.chatID = $routeParams.chatID;
	$scope.isLogin = true;
	$scope.messages = [];
	processMessages($scope.messages);

	//var $socket = io();
	$socket.emit('add user', 'Luphia');	// --
	$socket.on('login', function (data) {
		$scope.isLogin = true;
		// Display the welcome message
		data.type = "log";
		data.message = "Welcome to Kamato;";
		prependMessage(data);
	}).bindTo($scope);

	// Whenever the server emits 'new message', update the chat body
	$socket.on('new message', function (data) {
		data.type = "text";
		addMessage(data);
		gotoBottom();
	}).bindTo($scope);

	// Whenever the server emits 'user joined', log it in the chat body
	$socket.on('user joined', function (data) {
		data.message = data.user.name + ' joined';
		addLog(data);
	}).bindTo($scope);

	// Whenever the server emits 'user left', log it in the chat body
	$socket.on('user left', function (data) {
		data.message = data.user.name + ' left';
		addLog(data);

		removeChatTyping(data);
	}).bindTo($scope);

	// Whenever the server emits 'typing', show the typing message
	$socket.on('typing', function (data) {
		addChatTyping(data);
	}).bindTo($scope);

	// Whenever the server emits 'stop typing', kill the typing message
	$socket.on('stop typing', function (data) {
		removeChatTyping(data);
	}).bindTo($scope);
}]);