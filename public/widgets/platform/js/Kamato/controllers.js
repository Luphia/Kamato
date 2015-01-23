'use strict';

/* Controllers */
var KamatoControllers = angular.module('KamatoControllers', ['ngDialog', 'ui.bootstrap']);
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
	$scope.medias = [
		{"title": "Legal High 001", "src": "/public/LHEP001.mp4", "poster": "/public/LHEP001.jpg"},
		{"title": "Legal High 002", "src": "/public/LHEP002.mp4", "poster": "/public/LHEP002.jpg"},
		{"title": "Legal High 003", "src": "/public/LHEP003.mp4", "poster": "/public/LHEP003.jpg"},
		{"title": "Legal High 004", "src": "/public/LHEP004.mp4", "poster": "/public/LHEP004.jpg"},
		{"title": "Legal High 005", "src": "/public/LHEP005.mp4", "poster": "/public/LHEP005.png"},
		{"title": "Legal High 006", "src": "/public/LHEP006.mp4", "poster": "/public/LHEP006.png"},
		{"title": "Legal High 007", "src": "/public/LHEP007.mp4", "poster": "/public/LHEP007.png"},
		{"title": "Legal High 008", "src": "/public/LHEP008.mp4", "poster": "/public/LHEP008.png"},
		{"title": "Legal High 009", "src": "/public/LHEP009.mp4", "poster": "/public/LHEP009.png"},
		{"title": "Legal High 010", "src": "/public/LHEP010.mp4", "poster": "/public/LHEP010.png"},
		{"title": "Legal High 011", "src": "/public/LHEP011.mp4", "poster": "/public/LHEP011.png"}
	];
	$scope.play = $scope.medias[0];
	$scope.choose = function(m) {
		$scope.play = m;
	};

});

KamatoControllers.controller('PlatformCtrl', function ($scope, $http, ngDialog) {
	$scope.resources = [
		{"name": "Facebook"},
		{"name": "GooglePlus"},
		{"name": "NikePlus"},
		{"name": "RunKeeper"},
		{"name": "Fitbit"},
		{"name": "Jawbone"},
	];

	$scope.sidebar = [
		{"page": "APP 管理","submenu": [
			{"name": "Runtime 管理"},
			{"name": "用戶管理"}, 
			{"name": "用量分析"}, 
			{"name": "APP Store資訊"}, 
			{"name": "公開發布資訊"}]
		},
		{"page": "EasyDB Manager", "submenu": [
			{"name": "Excel 式操作介面"},
			{"name": "支援 SQL 操作"},
			{"name": "非結構化資料儲存"},
			{"name": "支援操作外部資料"},
			{"name": "資料表特性設定"},
			{"name": "資料表結構調整"},]
		},
		{"page": "Channel Manager", "submenu": [
			{"name": "頻道建立"},
			{"name": "被動發佈設定"},
			{"name": "發佈對象設定"},
			{"name": "頻道流量分析"},
			{"name": "存取權限控管"},]
		},
		{"page": "外部資料授權", "submenu": [
			// {"name": "取得外部資料授權"},
			// {"name": "建立外部資料虛擬表"}
			]
		},
		{"page": "外部資源託管", "submenu": [
			// {"name": ""},
			// {"name": ""},
			// {"name": ""},
			// {"name": ""},
			// {"name": ""},
			// {"name": ""},
			]
		},
	];

	$scope.auth_name = function (website){
		this.website = website;

	} 

	$scope.openDialog = function (resource_name){
		console.log(resource_name);
		switch(resource_name){
			case "Facebook":
				ngDialog.open({
					template: 'fb_login_permission' ,
					controller:  'PlatformFbDialogCtrl'
				});
				break;

			case "GooglePlus":
				ngDialog.open({
					template: 'GooglePlus_login_permission' ,
					controller:  'PlatformGoogleDialogCtrl'
				});
				break;

			case "NikePlus":
				ngDialog.open({
					template: 'NikePlus_login_permission' ,
					controller:  'PlatformNikeDialogCtrl'
				});
				break;

			case "RunKeeper":
				ngDialog.open({
					template: 'RunKeeper_login_permission' ,
					controller:  'PlatformRKDialogCtrl'
				});
				break;

			case "Fitbit":
				ngDialog.open({
					template: 'Fitbit_login_permission' ,
					controller:  'PlatformFitbitDialogCtrl'
				});
				break;

			case "Jawbone":
				ngDialog.open({
					template: 'Jawbone_login_permission' ,
					controller:  'PlatformJawboneDialogCtrl'
				});	
				break;
		}

	}

});

KamatoControllers.controller('submenuCollapseCtrl', function($scope){
	$scope.isCollapsed = true;
});

KamatoControllers.controller('PlatformFbDialogCtrl', function($scope, $http){
	$scope.check = true;

	$scope.auth_category=[
		{"name": "Profile"},
		{"name": "Friends"},
		{"name": "Activities"},
		{"name": "Nutrition"},
		{"name": "Sleep"},
		{"name": "Physiological"},
	]

	$scope.pers = [
		{"category": "Profile", "name": "Profile", "decription": "id,,name, first_name, last_name, link, gender, locale, age_range"},
		{"category": "Profile", "name": "E-mail", "decription": "email"},
		{"category": "Profile", "name": "About me", "decription": "user_about_me"},
		{"category": "Profile", "name": "Birthday", "decription": "user_birthday"},
		{"category": "Profile", "name": "Education History", "decription": "user_education_history"},
		{"category": "Profile", "name": "Hometown", "decription": "user_hometown"},
		{"category": "Profile", "name": "Interests", "decription": "user_interests"},
		{"category": "Profile", "name": "Location", "decription": "user_location"},
		{"category": "Profile", "name": "Website", "decription": "user_website"},
		{"category": "Friend", "name": "Friends", "decription": "user_friends"},
		{"category": "Activity", "name": "Fitness", "decription": "user_actions.fitness"},
		{"category": "Activity", "name": "Actions", "decription": "user_actions"},
		{"category": "Activity", "name": "Activities", "decription": "user_activities"},
		{"category": "Activity", "name": "Like", "decription": "user_like"},		
		{"category": "Nutrition", "name": "", "decription": ""},
		{"category": "Sleep", "name": "", "decription": ""},
		{"category": "Physiological", "name": "", "decription": ""},
		// {"category": "people", "name": "user_actions.books", "decription": "user_actions.books"},
		// {"category": "people", "name": "user_actions.music", "decription": "user_actions.music"},
		// {"category": "people", "name": "user_actions.news", "decription": "user_actions.news"},
		// {"category": "people", "name": "user_actions.video", "decription": "user_actions.video"},
		// {"category": "people", "name": "Events", "decription": "user_events"},
		// {"category": "people", "name": "user_games_activity", "decription": "user_games_activity"},
		// {"category": "people", "name": "Groups", "decription": "user_groups"},
		// {"category": "people", "name": "Relationships", "decription": "user_relationships"},
		// {"category": "people", "name": "user_relationship_details", "decription": "user_relationship_details"},
		// {"category": "people", "name": "user_religion_politics", "decription": "user_religion_politics"},
		// {"category": "people", "name": "Status", "decription": "user_status"},
		// {"category": "people", "name": "user_videos", "decription": "user_videos"},
		// {"category": "people", "name": "Work History", "decription": "user_work_history"},
		// {"category": "people", "name": "Read Friendlists", "decription": "read_friendlists"},
		// {"category": "people", "name": "read_insights", "decription": "read_insights"},
		// {"category": "people", "name": "read_mailbox", "decription": "read_mailbox"},
		// {"category": "people", "name": "read_page_mailboxes", "decription": "read_page_mailboxes"},
		// {"category": "people", "name": "read_stream", "decription": "read_stream"},
		// {"category": "people", "name": "manage_notifications", "decription": "manage_notifications"},
		// {"category": "people", "name": "manage_pages", "decription": "manage_pages"},
		// {"category": "people", "name": "publish_actions", "decription": "publish_actions"},
		// {"category": "people", "name": "rsvp_event", "decription": "rsvp_event"},
	];
	
	$scope.auth_array = [];

	$scope.isAuth = function(per){
		$scope.isClicked = $scope.auth_array.indexOf(per);

		if($scope.isClicked == -1){
			$scope.auth_array.push(per);
		}
		else{
			$scope.auth_array.splice($scope.auth_array.indexOf(per),1);
			
		}
	}
})

KamatoControllers.controller('PlatformGoogleDialogCtrl', function($scope, $http){
	$scope.check = true;

	$scope.auth_category=[
		{"name": "Profile"},
		{"name": "Friends"},
		{"name": "Activities"},
		{"name": "Nutrition"},
		{"name": "Sleep"},
		{"name": "Physiological"},
	]	

	$scope.pers = [
		// {"category": "Profile", "name": "id", "decription": "id"},	
		{"category": "Profile", "name": "displayName", "decription": "displayName"},
		{"category": "Profile", "name": "name", "decription": "formatted, familyName, givenName, middleName, honorificPrefix, honorificSuffix"}, //formatted, familyName, givenName, middleName, honorificPrefix, honorificSuffix
		{"category": "Profile", "name": "nickname", "decription": "nickname"},
		{"category": "Profile", "name": "birthday", "decription": "birthday"},
		{"category": "Profile", "name": "gender", "decription": "gender"},
		{"category": "Profile", "name": "currentLocation", "decription": "currentLocation"},
		{"category": "Profile", "name": "url", "decription": "url"},	
		{"category": "Profile", "name": "image", "decription": "image"}, //url
		{"category": "Profile", "name": "aboutMe", "decription": "aboutMe"},
		{"category": "Profile", "name": "organizations", "decription": "organizations"}, //name, department, title, type, startDate, endDate, location, description, primary
		{"category": "Profile", "name": "placesLived", "decription": "placesLived"}, //value, primary
		{"category": "Profile", "name": "emails", "decription": "emails"}, //value, type, primary
		{"category": "Profile", "name": "braggingRights", "decription": "braggingRights"},//使用者的輝煌事蹟
		{"category": "Activity", "name": "title", "decription": "activity title"},
		{"category": "Activity", "name": "published", "decription": "published post time"},
		{"category": "Activity", "name": "updated", "decription": "updated post time"},
		// {"category": "Activity", "name": "id", "decription": "activity id"},
		{"category": "Activity", "name": "url", "decription": "activity url"},
		{"category": "Activity", "name": "actor", "decription": "actor"},
		{"category": "Activity", "name": "url", "decription": "activity"},
		{"category": "Activity", "name": "", "decription": "activity"},
		{"category": "Activity", "name": "", "decription": "activity"},
		{"category": "Activity", "name": "", "decription": "activity"},
		{"category": "Activity", "name": "", "decription": "activity"},
		{"category": "Activity", "name": "", "decription": "activity"},
		{"category": "Activity", "name": "", "decription": "activity"},
		{"category": "Activity", "name": "", "decription": "activity"},
		{"category": "Activity", "name": "", "decription": "activity"},


		// {"category": "people", "name": "hasApp", "decription": "hasApp"},
		// {"category": "people", "name": "relationshipStatus", "decription": "relationshipStatus"},
		// {"category": "people", "name": "urls", "decription": "urls"},
		// {"category": "people", "name": "tagline", "decription": "tagline"},
		// {"category": "people", "name": "objectType", "decription": "objectType"},
		// {"category": "people", "name": "isPlusUser", "decription": "isPlusUser"},
		// {"category": "people", "name": "plusOneCount", "decription": "plusOneCount"},
		// {"category": "people", "name": "cover", "decription": "cover"}, //layout, coverPhoto, coverPhoto, height, width, coverInfo, topImageOffset, leftImageOffset
		// {"category": "people", "name": "language", "decription": "language"},
	];
	
	$scope.auth_array = [];

	$scope.isAuth = function(per){
		$scope.isClicked = $scope.auth_array.indexOf(per);

		if($scope.isClicked == -1){
			$scope.auth_array.push(per);
		}
		else{
			$scope.auth_array.splice($scope.auth_array.indexOf(per),1);
			
		}
	}
})

KamatoControllers.controller('PlatformNikeDialogCtrl', function($scope, $http){
	$scope.check = true;

	$scope.auth_category=[
		{"name": "Profile"},
		{"name": "Friends"},
		{"name": "Activities"},
		{"name": "Nutrition"},
		{"name": "Sleep"},
		{"name": "Physiological"},
	]

	$scope.pers = [
		{"name": "Client_id", "decription": "The client credentials provided by Nike+ for the application"},	
		{"name": "Redirect_uri", "decription": "The URI that the user will be redirected back to after authentication (Note: this URI must be whitelisted by Nike+)"},
		{"name": "Response_type", "decription": "Should always be set to the value code"}, 
		{"name": "State", "decription": "Any value that will be passed back when the user is redirected back to the application"},
		{"name": "Locale", "decription": "The locale of the user. The only locale supported currently is EN_US."},
	];
	
	$scope.auth_array = [];

	$scope.isAuth = function(per){
		$scope.isClicked = $scope.auth_array.indexOf(per);

		if($scope.isClicked == -1){
			$scope.auth_array.push(per);
		}
		else{
			$scope.auth_array.splice($scope.auth_array.indexOf(per),1);
			
		}
	}
})

KamatoControllers.controller('PlatformRKDialogCtrl', function($scope, $http){
	$scope.check = true;

	$scope.auth_category=[
		{"name": "Profile"},
		{"name": "Friends"},
		{"name": "Activities"},
		{"name": "Nutrition"},
		{"name": "Sleep"},
		{"name": "Physiological"},
	]

	$scope.pers = [
		{"name": "name", "decription": "The user's full name (omitted if not yet specified)"},	
		{"name": "location", "decription": "The user's geographical location (omitted if not yet specified)"},
		{"name": "name", "decription": "formatted, familyName, givenName, middleName, honorificPrefix, honorificSuffix"}, //formatted, familyName, givenName, middleName, honorificPrefix, honorificSuffix
		{"name": "nickname", "decription": "nickname"},
		{"name": "birthday", "decription": "birthday"},
		{"name": "gender", "decription": "gender"},
		{"name": "currentLocation", "decription": "currentLocation"},
		{"name": "url", "decription": "url"},	
		{"name": "image", "decription": "image"}, //url
		{"name": "hasApp", "decription": "hasApp"},
		{"name": "aboutMe", "decription": "aboutMe"},
		{"name": "relationshipStatus", "decription": "relationshipStatus"},
		{"name": "urls", "decription": "urls"},
		{"name": "organizations", "decription": "organizations"}, //name, department, title, type, startDate, endDate, location, description, primary
		{"name": "placesLived", "decription": "placesLived"}, //value, primary
		{"name": "tagline", "decription": "tagline"},
		{"name": "emails", "decription": "emails"}, //value, type, primary
		{"name": "objectType", "decription": "objectType"},
		{"name": "isPlusUser", "decription": "isPlusUser"},
		{"name": "braggingRights", "decription": "braggingRights"},//使用者的輝煌事蹟
		{"name": "plusOneCount", "decription": "plusOneCount"},
		{"name": "cover", "decription": "cover"}, //layout, coverPhoto, coverPhoto, height, width, coverInfo, topImageOffset, leftImageOffset
		{"name": "language", "decription": "language"},
	];
	
	$scope.auth_array = [];

	$scope.isAuth = function(per){
		$scope.isClicked = $scope.auth_array.indexOf(per);

		if($scope.isClicked == -1){
			$scope.auth_array.push(per);
		}
		else{
			$scope.auth_array.splice($scope.auth_array.indexOf(per),1);
			
		}
	}
})


KamatoControllers.controller('PlatformFitbitDialogCtrl', function($scope, $http){
	$scope.check = true;

	$scope.auth_category=[
		{"name": "Profile"},
		{"name": "Friends"},
		{"name": "Activities"},
		{"name": "Nutrition"},
		{"name": "Sleep"},
		{"name": "Physiological"},
	]

	$scope.pers = [
		{"name": "id", "decription": "id"},	
		{"name": "displayName", "decription": "displayName"},
		{"name": "name", "decription": "formatted, familyName, givenName, middleName, honorificPrefix, honorificSuffix"}, //formatted, familyName, givenName, middleName, honorificPrefix, honorificSuffix
		{"name": "nickname", "decription": "nickname"},
		{"name": "birthday", "decription": "birthday"},
		{"name": "gender", "decription": "gender"},
		{"name": "currentLocation", "decription": "currentLocation"},
		{"name": "url", "decription": "url"},	
		{"name": "image", "decription": "image"}, //url
		{"name": "hasApp", "decription": "hasApp"},
		{"name": "aboutMe", "decription": "aboutMe"},
		{"name": "relationshipStatus", "decription": "relationshipStatus"},
		{"name": "urls", "decription": "urls"},
		{"name": "organizations", "decription": "organizations"}, //name, department, title, type, startDate, endDate, location, description, primary
		{"name": "placesLived", "decription": "placesLived"}, //value, primary
		{"name": "tagline", "decription": "tagline"},
		{"name": "emails", "decription": "emails"}, //value, type, primary
		{"name": "objectType", "decription": "objectType"},
		{"name": "isPlusUser", "decription": "isPlusUser"},
		{"name": "braggingRights", "decription": "braggingRights"},//使用者的輝煌事蹟
		{"name": "plusOneCount", "decription": "plusOneCount"},
		{"name": "cover", "decription": "cover"}, //layout, coverPhoto, coverPhoto, height, width, coverInfo, topImageOffset, leftImageOffset
		{"name": "language", "decription": "language"},
	];
	
	$scope.auth_array = [];

	$scope.isAuth = function(per){
		$scope.isClicked = $scope.auth_array.indexOf(per);

		if($scope.isClicked == -1){
			$scope.auth_array.push(per);
		}
		else{
			$scope.auth_array.splice($scope.auth_array.indexOf(per),1);
			
		}
	}
})

KamatoControllers.controller('PlatformJawboneDialogCtrl', function($scope, $http){
	$scope.check = true;

	$scope.auth_category=[
		{"name": "Profile"},
		{"name": "Friends"},
		{"name": "Activities"},
		{"name": "Nutrition"},
		{"name": "Sleep"},
		{"name": "Physiological"},
	]

	$scope.pers = [
		{"name": "id", "decription": "id"},	
		{"name": "displayName", "decription": "displayName"},
		{"name": "name", "decription": "formatted, familyName, givenName, middleName, honorificPrefix, honorificSuffix"}, //formatted, familyName, givenName, middleName, honorificPrefix, honorificSuffix
		{"name": "nickname", "decription": "nickname"},
		{"name": "birthday", "decription": "birthday"},
		{"name": "gender", "decription": "gender"},
		{"name": "currentLocation", "decription": "currentLocation"},
		{"name": "url", "decription": "url"},	
		{"name": "image", "decription": "image"}, //url
		{"name": "hasApp", "decription": "hasApp"},
		{"name": "aboutMe", "decription": "aboutMe"},
		{"name": "relationshipStatus", "decription": "relationshipStatus"},
		{"name": "urls", "decription": "urls"},
		{"name": "organizations", "decription": "organizations"}, //name, department, title, type, startDate, endDate, location, description, primary
		{"name": "placesLived", "decription": "placesLived"}, //value, primary
		{"name": "tagline", "decription": "tagline"},
		{"name": "emails", "decription": "emails"}, //value, type, primary
		{"name": "objectType", "decription": "objectType"},
		{"name": "isPlusUser", "decription": "isPlusUser"},
		{"name": "braggingRights", "decription": "braggingRights"},//使用者的輝煌事蹟
		{"name": "plusOneCount", "decription": "plusOneCount"},
		{"name": "cover", "decription": "cover"}, //layout, coverPhoto, coverPhoto, height, width, coverInfo, topImageOffset, leftImageOffset
		{"name": "language", "decription": "language"},
	];
	
	$scope.auth_array = [];

	$scope.isAuth = function(per){
		$scope.isClicked = $scope.auth_array.indexOf(per);

		if($scope.isClicked == -1){
			$scope.auth_array.push(per);
		}
		else{
			$scope.auth_array.splice($scope.auth_array.indexOf(per),1);
			
		}
	}
})

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