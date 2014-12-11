Kamato.register.controller('ChatCtrl', ['$scope', '$compile', '$window', '$routeParams', '$http', 'socket', function($scope, $compile, $window, $routeParams, $http, $socket) {
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

Kamato.register.directive('message', function($compile) {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'widgets/chat/template-message.html'
	}
});

Kamato.register.directive('pin', function($compile) {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'widgets/chat/template-pin.html'
	}
});