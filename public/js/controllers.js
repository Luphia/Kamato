'use strict';

/* Controllers */
var KamatoControllers = angular.module('KamatoControllers', []);
KamatoControllers.controller('SummaryCtrl', ['$scope', '$http', function($scope, $http) {
	/*
	$http.get('./data/cases.json').success(function(data) {
		$scope.cases = data;
	});
	*/

	$scope.login = function() {
		var data = {account: $scope.account, password: $scope.password}
		$http.post('/login', data).success(function(_data, _status, _headers, _config) {
			console.log(_data);
		}).
		error(function(_data, _status, _headers, _config) {
			console.log(_data);
		});
	};
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

	var Point =function(center) {
		var types = ["play", "play", "play", "play", ""];
		var type = types[Math.floor(Math.random()*types.length)];
		var randX = Math.floor(Math.random() * 20);
		var randY = Math.floor(Math.random() * 7);

		if(center) {
			randX = 10;
			randY = 3;
		}

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
	$scope.you = new Point(true);
	$scope.you.o = 100;
	$scope.you.type = "me";
	$scope.positions.push($scope.you);
	exists.push($scope.you.x + "," + $scope.you.y);

	var addChannel = function(render) {
		var point = new Point();
		var aPoint = point.x + "," + point.y;
		var aIndex = exists.indexOf(aPoint);

		if(aIndex == 0) {

		}
		else if(aIndex > -1) {
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

KamatoControllers.controller('ChatCtrl', ['$scope', '$compile', '$window', '$routeParams', '$http', 'socket', function($scope, $compile, $window, $routeParams, $http, $socket) {
	/* message type: log text link emotion image sound video */
	var COLORS = [
		'#e2aa99', '#ccbbaa', '#f8cc88', '#f7aa55',
		'#aadd88', '#78bb50', '#c8f095', '#7be8c4',
		'#6699cc', '#aa88dd', '#ccbbff', '#d3aae7'
	];

	$scope.end = false;

	$scope.pins = [
		{'image': 'http://www.cloudopenlab.org.tw/images/button-iaas.png', 'content': 'iServDC 是基於 OpenStack 為基礎，提供類 AWS 之雲端 IaaS 服務環境解決方案，以系統架構來說主要是由前端營運系統架構與後端核心系統架構所構成，以使用功能來說是由系統管理、用戶入口以及營運管理三個子系統來構成之完整服務系統，讓系統管理者(Administrator)、系統維運者(Operator)以及用戶(Client)這三種身份類型人員均能快速與安全的使用其專屬之功能介面。', 'channel': 'iServDC'},
		{'image': '/res/iServStore.png', 'content': 'TiApp (Triple I appliance) 是像智慧型手機的小機房，機房內的伺服器配置只需彈指之間即可完成，讓您佈署伺服器就像是下載 APP，單手就能處理機房裡的疑難雜症，還可以將您的服務發佈於各種雲端環境的 Server 市集。', 'channel': 'iServStore'},
		{'image': '/res/iServStorage.png', 'content': 'iServStorage 是一個高安全性與私密保護的雲端儲存服務，您的重要檔案將會經過加密並慎重地切細分割才保存到雲端空間中，除了您自己，任何人都沒辦法取得您的雲端檔案內容，就連 iServStorage 管理人員也不行，當您的意外發生時只需要滑鼠輕輕一點，所有資料便能重新回到您的手上。', 'channel': 'iServStorage'},
		{'image': '/res/Appliance.png', 'content': 'III Appliance 提供完整的管理功能、智慧型介面設計，簡易的映像檔安裝，他集結了 open source 免費資源，彙整企業實用商品，搭配強大開源/商用軟體映像檔商城，省去系統與應用程式搜選、相容性考量，以及安裝與移除等繁雜程序。即載即用，讓中小企業方便嘗試多種商用軟體，以便廠商選擇最合用之項目，提高生產力。', 'channel': 'Appliance'},
		{'image': 'http://iservdb.cloudopenlab.org.tw/docs/_media/iservdb-general-concepts.png?w=500&tok=244fe8', 'content': 'iServDB是一個分散式資料庫管理系統(Distributed Database Management System)，以資料社群(Data Community)為理念研發，整合管理所有領域相關的資料，以標準SQL指令淬取關鍵資訊，讓應用服務專注於創新研發。', 'channel': 'EasyDB'}
	];

	$scope.join = function(ch) {
		if(!ch.listen) {
			$socket.emit('join', ch.channel);
			ch.listen = !ch.listen;
		}
		else {
			$socket.emit('leave', ch.channel);
			ch.listen = !ch.listen;
		}
		console.log(ch.channel);
	};

	$scope.initializeWindowSize = function() {
		$scope.windowHeight = $window.innerHeight;
		$scope.chatAreaHeight = $window.innerHeight - 60;
		$scope.inputAreawidth = $window.innerWidth - 20;
		$scope.boardWidth = ($window.innerWidth > 1300)? $window.innerWidth - 420 : 900;
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
	var addMessage = function(message, pre) {
		if(pre) {
			$scope.messages.unshift(processMessage(message));
		}
		else {
			$scope.messages.push(processMessage(message));
		}
	};
	var addLog = function(message) {
		message.type = 'log';
		$scope.messages.push(processMessage(message));
	};
	var prependMessage = function(message) {
		if(message.length == 0) {
		}
		else if(message.length > 0) {
			for(var k in message) {
				addMessage(message[k], true);
			}
		}
		else {
			addMessage(message, true);
		}
	};
	var sendMessage = function() {
		var text = $scope.newMessage;
		if (text.length == 0) { return false; }

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
	$scope.sendMessage = sendMessage;

	var addChatTyping = function(data) {
		console.log(data);
	};
	var removeChatTyping = function(data) {
		console.log(data);
	};

	var gotoBottom = function() {

	};
	var gotoTop = function() {

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

	var listen = {"channel": "default", "timestamp": new Date() * 1};
	$scope.loadMessage = function() {
		if($scope.end) { return false; }
		$socket.emit('load message', listen);
	};

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
	$socket.emit('add user', 'Somebody');	// --
	$scope.loadMessage();
	$socket.on('login', function (data) {
		$scope.isLogin = true;
		// Display the welcome message
		data.type = "log";
		data.message = "Welcome to Kamato;";
		prependMessage(data);
	}).bindTo($scope);

	// Whenever the server emits 'new message', update the chat body
	$socket.on('load message', function (data) {
		var n = data.messages.length
		$scope.end = !(n > 0);
		if(!$scope.end) { listen.timestamp = new Date(data.messages[n-1].timestamp) * 1; }

		prependMessage(data.messages);
		gotoTop();
	}).bindTo($scope);
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

KamatoControllers.controller('MediaCtrl', function($scope, $http) {
	$scope.initializeWindowSize = function() {
		return $scope.height = $window.innerHeight - 60;
	};
	$scope.initializeWindowSize();
	angular.element($window).bind('resize', function() {
		$scope.initializeWindowSize();
		return $scope.$apply();
	});

	$scope.medias = [
		{"title": "Legal High 001", "src": "/public/LHEP001.mp4", "poster": "/public/LHEP001.jpg", "type": "video/mp4"},
		{"title": "Legal High 002", "src": "/public/LHEP002.mp4", "poster": "/public/LHEP002.jpg", "type": "video/mp4"},
		{"title": "Legal High 003", "src": "/public/LHEP003.mp4", "poster": "/public/LHEP003.jpg", "type": "video/mp4"},
		{"title": "Legal High 004", "src": "/public/LHEP004.mp4", "poster": "/public/LHEP004.jpg", "type": "video/mp4"},
		{"title": "Legal High 005", "src": "/public/LHEP005.mp4", "poster": "/public/LHEP005.png", "type": "video/mp4"},
		{"title": "Legal High 006", "src": "/public/LHEP006.mp4", "poster": "/public/LHEP006.png", "type": "video/mp4"},
		{"title": "Legal High 007", "src": "/public/LHEP007.mp4", "poster": "/public/LHEP007.png", "type": "video/mp4"},
		{"title": "Legal High 008", "src": "/public/LHEP008.mp4", "poster": "/public/LHEP008.png", "type": "video/mp4"},
		{"title": "Legal High 009", "src": "/public/LHEP009.mp4", "poster": "/public/LHEP009.png", "type": "video/mp4"},
		{"title": "Legal High 010", "src": "/public/LHEP010.mp4", "poster": "/public/LHEP010.png", "type": "video/mp4"},
		{"title": "Legal High 011", "src": "/public/LHEP011.mp4", "poster": "/public/LHEP011.png", "type": "video/mp4"},
		{"title": "Legal High II 001", "src": "/public/LH2EP001.mp4", "poster": "/public/LH2EP001.png", "type": "video/mp4"},
		{"title": "Legal High II 002", "src": "/public/LH2EP002.mp4", "poster": "/public/LH2EP002.png", "type": "video/mp4"},
		{"title": "Legal High II 003", "src": "/public/LH2EP003.mp4", "poster": "/public/LH2EP003.png", "type": "video/mp4"},
		{"title": "Legal High II 004", "src": "/public/LH2EP004.mp4", "poster": "/public/LH2EP004.png", "type": "video/mp4"},
		{"title": "Legal High II 005", "src": "/public/LH2EP005.mp4", "poster": "/public/LH2EP005.png", "type": "video/mp4"},
		{"title": "Legal High II 006", "src": "/public/LH2EP006.mp4", "poster": "/public/LH2EP006.png", "type": "video/mp4"},
		{"title": "Legal High II 007", "src": "/public/LH2EP007.mp4", "poster": "/public/LH2EP007.png", "type": "video/mp4"},
		{"title": "Legal High II 008", "src": "/public/LH2EP008.mp4", "poster": "/public/LH2EP008.png", "type": "video/mp4"},
		{"title": "Legal High II 009", "src": "/public/LH2EP009.mp4", "poster": "/public/LH2EP009.png", "type": "video/mp4"},
		{"title": "Legal High II 010", "src": "/public/LH2EP010.mp4", "poster": "/public/LH2EP010.png", "type": "video/mp4"},
		{"title": "Legal High SP", "src": "/public/LHSP.mp4", "poster": "/public/LHSP.png", "type": "video/mp4"}
	];
	$scope.play = $scope.medias[0];
	$scope.choose = function(m) {
		$scope.play = m;
	};

});

KamatoControllers.controller('PlatformCtrl', function($scope, $http) {
	$scope.resources = [
		{"name": "Nike+"},
		{"name": "RunKeeper"},
		{"name": "Fitbit"},
		{"name": "Jawbone"}
	];
});

KamatoControllers.controller('ArtmatchCtrl', function($scope, $http) {
	var preprocess = function(_data) {
		for(var k in _data) {
			if(_data[k].price.length > 0) {
				_data[k].displayPrice = Math.max.apply(null, _data[k].price);
			}
		}
	};
	$scope.search = {};
	$scope.events = [
		{"id": 1, "title": "活動串場演奏", "author": "Lazy lady", "tag": ["另類搖滾", "另類金屬", "新金屬"], "location": "台北, 中山區", "price": [], "like": 7651, "view": 9321},
		{"id": 2, "title": "親子互動劇場", "author": "狂想劇場", "tag": ["舞台劇"], "location": "台北, 大安區", "price": [], "like": 7651, "view": 9321},
		{"id": 3, "title": "大師級 Lockin 演出", "author": "Steady point", "tag": ["街舞", "Lockin"], "location": "台北, 中山區", "price": [], "like": 7651, "view": 9321},
		{"id": 4, "title": "小型咖啡廳演唱", "author": " Crispy 脆樂團", "tag": ["放客"], "location": "台北, 大同區", "price": [], "like": 7651, "view": 9321},
		{"id": 5, "title": "小劇場現代舞表演", "author": "林文中舞團", "tag": ["現代舞"], "location": "台北, 文山區", "price": [], "like": 7651, "view": 9321},
		{"id": 6, "title": "街舞 hip-hop 表演", "author": "Lazy lady", "tag": ["另類搖滾", "另類金屬", "新金屬"], "location": "台北, 中山區", "price": [], "like": 7651, "view": 9321},
		{"id": 7, "title": "創新元素現代舞", "author": "周先生與舞者們", "tag": ["現代舞"], "location": "台北, 北投區", "price": [7500, 7500], "like": 7651, "view": 9321},
		{"id": 8, "title": "刺激 Battle 演出", "author": "Double kill", "tag": ["街舞", "Breakin"], "location": "台北, 中正區", "price": [], "like": 7651, "view": 9321},
		{"id": 9, "title": "校園民歌演唱", "author": "白眼罩樂團", "tag": ["民謠"], "location": "台北, 士林區", "price": [], "like": 7651, "view": 9321}
	];
	$scope.types = [
		{"name": "全部"},
		{"name": "音樂"},
		{"name": "舞蹈"},
		{"name": "戲劇"}
	];
	$scope.user = {name: "Artista", image: "/res/artista/_14.png"};
});