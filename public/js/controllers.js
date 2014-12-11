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

KamatoControllers.controller('PlatformCtrl', function ($scope, $http, $modal, ngDialog, $rootScope) {


// ====================== APP管理 top======================
	$scope.app_oper = [
		// {'tip': 'Home', 'icon': 'sa-list-home'},
		{'tip': 'Back', 'icon': 'sa-list-back', 'link': '#/platform/APP'},
		{'tip': 'Folder', 'icon': 'sa-list-folder', 'link': '#/platform/APP/folder'},
		{'tip': 'Activity', 'icon': 'sa-list-activity', 'link': '#/platform/APP/activity'},
		{'tip': 'Info.', 'icon': 'sa-list-info','link': '#/platform/APP/info'},
		// {'tip': 'Upload', 'icon': 'sa-list-upload', 'link': '#/platform/APP/upload'}
	];

	$scope.create_app = false;
	$scope.new_app_required = false;
	$scope.change_page = function(){
		$scope.new_app_required = false;
		$scope.create_app = !$scope.create_app;
	}

	$scope.new_app = function(){
		if(this.new_app_name != null){		
			$scope.appList.push({'name': this.new_app_name});
			$scope.create_app = !$scope.create_app;
		}
		else{
			$scope.new_app_required = true;
		}
	}

	$scope.appSearch = [];

	$scope.cleanSearch = function(){
		$scope.appSearch = [];
	}

	$scope.appList = [
		{'name': 'Run for Health'},
		{'name': 'iRunning'},
		{'name': 'Go123'},
		{'name': 'Fitness'},
		{'name': 'Slim'},
	]

	$scope.fileNameChange = function(elem){
		$scope.files = elem.files;	
		$scope.$apply();
	}

	$scope.test_file= {
			'Path':'public/',
			'files':[
				{'datatype': 'folder', 'name': 'css', 'icon': 'sa-list-folder','file_size': '', 'Last_revise': '2014/11/25'},
				{'datatype': 'folder', 'name': 'js', 'icon': 'sa-list-folder','file_size': '', 'Last_revise': '2014/11/25'},
				{'datatype': 'folder', 'name': 'lib', 'icon': 'sa-list-folder','file_size': '', 'Last_revise': '2014/11/25'},
				{'datatype': 'folder', 'name': 'simple', 'icon': 'sa-list-folder','file_size': '', 'Last_revise': '2014/11/25'},
				{'datatype': 'folder', 'name': 'widget', 'icon': 'sa-list-folder','file_size': '', 'Last_revise': '2014/11/25'},
				{'datatype': 'html', 'name': 'index.html', 'icon': 'sa-list-file','file_size': '234kb', 'Last_revise': '2014/11/25'},
				{'datatype': 'txt', 'name': 'README.md', 'icon': 'sa-list-file','file_size': '234kb', 'Last_revise': '2014/11/25'},
			],
		}


	$scope.daily_req = function(reqs){    //傳入一個陣列, 包含30內天的req值
		var d = Math.floor((new Date()).getTime()/1000)*1000;         //現在時間(毫秒)
		var temp  = [];
		for (var i = 0; i < 30; i++) {
				// var num = Math.floor((Math.random()*100));
				temp.push([d,reqs[i]]);            //e.g. [[x1,y1],[x2,y2]]
					d -= 86400000;             //毫秒
			}
		$scope.Request = temp;
	}


	var reqs=[324,324,255,466,523,43,43,23,123,43,24,359,345,45,543,43,234,755,234,74,77,231,324,34,653,853,63,61,86,245]
	$scope.daily_req(reqs);

	$scope.app_info_tab = [
		{'name': 'View Detail'},
		{'name': 'APP Developers'}
	]

	$scope.tab_name = 'View Detail';

	$scope.click = function(name){
		$scope.app_nav = name;
	}

	$scope.tab_clicked = function(name){
		$scope.tab_name = name;
	}

	$scope.app_info = [
		{'name': 'APP name','type':'text', 'tooltip': 'APP名稱'},
		{'name': 'Website','type':'url', 'tooltip': '管理頁面網址  ( Ex: http://...)'},
		{'name': 'Owner', 'type': 'text', 'tooltip': 'APP開發者, 擁有開發APP所有權限'},
		{'name': 'Collaborator', 'type': 'text', 'tooltip': 'APP共同開發者, 擁有大部分權限, 但無法新增、刪除其他開發者與APP'},
		{'name': 'Support Email', 'type': 'email', 'tooltip': '聯絡資訊'}
	]
// ====================== APP管理 bottom======================
// ====================== easydb top======================

	var db_link = "./manage/db/";

	$http.get(db_link).
        success(function(db) {
            $scope.tables = db.data;
            $scope.table_click(db.data[0]);
        });


    $scope.t_d_more = [];
    var jsonTemp = {};
	$scope.table_click =function(name){
		$scope.default_view_table = name;
		$http.get(db_link+name+"/").
        success(function(schema) {
        	var t_d_temp = schema.data.list;
        	$scope.t_head = schema.data.list[0];
        
        	angular.forEach(t_d_temp, function(list_value, list_key){
        		angular.forEach(t_d_temp[list_key], function(value, key){
        			var value_id = t_d_temp[list_key]._id;
        			if(typeof(value) == "object" && value != null){
        				//存json
        				
        				jsonTemp[value_id+key] = value;
        				$scope.t_d_more.push(jsonTemp);
        				//json換註解
        				t_d_temp[list_key][key] = "json file"
        			}
        			$scope.t_d = t_d_temp;
        		})
        	})
        });
	}   
	var pre_id="";
	$scope.is_show = false;
	$scope.show_json_file = function(id, key){
		$scope.is_show = true;
		var id_key = id+key;
		$scope.show_json= jsonTemp[id_key];
		var t = document.getElementById(id);
		var j_text = document.getElementsByClassName("json_text");
		var style = document.createAttribute('style');
		var box_width = j_text[0];

		if((event.pageX + j_text[0].offsetWidth) > 1583){
			var overside = event.pageX + j_text[0].offsetWidth-1583;
			style.value = "top:"+(event.offsetY+event.layerY)+"px; left:"+(event.layerX- overside)+"px";
		}
		else{
			style.value = "top:"+(event.offsetY+event.layerY)+"px; left:"+(event.layerX- event.offsetX)+"px";			
		}
		j_text[0].setAttributeNode(style);
		console.log(j_text);
		console.log(box_width.offsetWidth);
	}

	$scope.close = function(){
		$scope.is_show = false;
	}

	$scope.keyword = [
		{'name': 'SELECT * FROM table_name'},
		{'name': 'SELECT DISTINCT column_name,column_name FROM table_name'},
		{'name': 'SELECT column_name,column_name FROM table_name WHERE column_name operator value'},
		{'name': 'SELECT column_name FROM table_name WHERE column_name operator value AND column_name operator value'},
		{'name': 'SELECT column_name FROM table_name WHERE column_name operator value OR column_name operator value'},
		{'name': 'SELECT column_name,column_name FROM table_name ORDER BY column_name,column_name ASC|DESC'},
		{'name': 'SELECT column_name(s) FROM table_name WHERE column_name LIKE pattern'},
		{'name': 'SELECT column_name(s) FROM table_name WHERE column_name IN (value1,value2,...)'},
		{'name': 'SELECT column_name(s) FROM table_name WHERE column_name BETWEEN value1 AND value2'},
		{'name': 'SELECT AVG(column_name)  FROM  table_name'},
		{'name': 'SELECT COUNT(column_name)  FROM  table_name'},
		{'name': 'SELECT MAX(column_name)  FROM  table_name'},
		{'name': 'SELECT MIN(column_name)  FROM  table_name'},
		{'name': 'SELECT SUM(column_name)  FROM  table_name'},
		{'name': 'SELECT column_name  FROM  table_name GROUP BY column_name'},
		{'name': 'SELECT column_name  FROM  table_name GROUP BY column_name HAVING function(column_name)'},
		{'name': 'SELECT column_name AS alias_name FROM table_name'},
		{'name': 'SELECT column_name(s) FROM table_name AS alias_name'},
		{'name': 'SELECT column_name(s) FROM table1 INNER JOIN table2 ON table1.column_name = table2.column_name'},
		{'name': 'SELECT column_name(s) FROM table1 LEFT JOIN table2 ON table1.column_name=table2.column_name'},
		{'name': 'SELECT column_name(s) FROM table1 RIGHT JOIN table2 ON table1.column_name=table2.column_name'},
		{'name': 'SELECT column_name(s) FROM table1 FULL OUTER JOIN table2 ON table1.column_name=table2.column_name'},
		{'name': 'SELECT column_name(s) FROM table1 UNION SELECT column_name(s) FROM table2'},
		{'name': 'SELECT TOP number|percent column_name(s) FROM table_name'},
		{'name': 'INSERT INTO table_name VALUES (value1,value2,value3,...)'},
		{'name': 'UPDATE table_name SET column1=value1,column2=value2,... WHERE some_column=some_value'},
		{'name': 'DELETE FROM table_name WHERE some_column=some_value'},
		{'name': 'INSERT INTO table_name VALUES (value1,value2,value3,...)'},
	]

	$scope.show_sample = false;
	$scope.sample_list = function(){		
			$scope.show_sample = true;		
	}

	$scope.sql_keyword_clicked = function(name){
		$scope.command_sample = name;
		$scope.show_sample = false;
	}

	$scope.cant_close = false;
	$scope.close_sample_list = function(){
		if($scope.cant_close == false){
			$scope.show_sample = false;
		}
	}
// ====================== easydb bottom======================
// ====================== Channel top======================
	$scope.channel_navbar = [
		{'name': 'Channel Name'},
		{'name': 'Latency'},
		{'name': 'Connectors'},
		{'name': 'Msg Per Sec'},
		{'name': 'Bot Management'}
	];

	$scope.channel_info = [
		{'name': 'Channel 1', 'latency': 2.0, 'connectors': 5, 'msgs': 30, 'bots': 5, 'chart_title': '連接數'},
		{'name': 'Channel 2', 'latency': 1.0, 'connectors': 8, 'msgs': 20, 'bots': 2, 'chart_title': '每秒傳送訊息數量'}
	]

	$rootScope.$on('bots', function(event, data){
		$scope.channel_info.push({'name': data[0].name, 'latency': 2.0, 'connectors': 5, 'msgs': 30, 'bots': data.length-1 })
	});

	$scope.channel_detail = function(channel_clicked){
		var modalInstance = $modal.open({
			templateUrl: 'ChannelDetail',
			controller: 'ChannelDetailCrtl',
			size: 'lg',
			resolve:{
		        channel_info: function () {
		          return $scope.channel_info;
      		  },
      		  	channel: function() {
      		  		return channel_clicked;
      		  	}
			}
		});
	}

	$scope.createChannel = function(){
		var modalInstance = $modal.open({
			templateUrl: 'ChannelInit',
			controller: 'ChannelInitCrtl',
			size: 'lg',
			resolve:{
				channel_init: function () {
		          return $scope.channel_init;
      		  }
			}
		});
	}

	$scope.del_channel = function(channel) {
		$scope.channel_info.splice($scope.channel_info.indexOf(channel),1)
	}
// ====================== Channel bottom======================
// ====================== api top======================
	$scope.resources = [
		{"name": "Facebook"},
		{"name": "GooglePlus"},
		// {"name": "NikePlus"},
		{"name": "RunKeeper"},
		{"name": "Fitbit"},
		{"name": "Jawbone"},
	];

	$scope.openDialog = function (resource_name){
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

	$scope.api_list = true;
	$scope.create_api = false;
	$scope.req_chart = false;

	$scope.create_api_page = function(){
		$scope.api_list = false;
		$scope.create_api = true;
	}

	$scope.return_api_page = function(){
		$scope.new_api_required = false;
		$scope.api_list = true;
		$scope.create_api = false;
		$scope.req_chart = false;
	}

	$scope.show_apiReq_chart = function(){
		$scope.req_chart = true;
		$scope.api_list = false;
	}

	// $scope.daily_req = function(reqs){    //傳入一個陣列, 包含30內天的req值
	// 	var d = Math.floor((new Date()).getTime()/1000)*1000;         //現在時間(毫秒)
	// 	var temp  = [];
	// 	for (var i = 0; i < 30; i++) {
	// 			// var num = Math.floor((Math.random()*100));
	// 			temp.push([d,reqs[i]]);            //e.g. [[x1,y1],[x2,y2]]
	// 				d -= 86400000;             //毫秒
	// 		}
	// 	$scope.Request = temp;
	// }


	// var reqs=[324,324,255,466,523,43,43,23,123,43,24,359,345,45,543,43,234,755,234,74,77,231,324,34,653,853,63,61,86,245]
	// $scope.daily_req(reqs);

	$scope.del_api = function(api){
		$scope.apiList.splice($scope.apiList.indexOf(api),1);
	}

	$scope.api_table_head = [
		{'name': 'API List'},
		{'name': 'Category'},
		{'name': 'Field'},
		{'name': ''}
	]

	$scope.apiList = [
		{'name': 'NikePlus', 'cate': [{'property': 'Nutrition'}], 'field': 'Sport'},
		{'name': 'Runkeeper', 'cate':  [{'property': 'Nutrition'}, {'property': 'Friend'}], 'field': 'Sport'},
		{'name': 'GooglePlus', 'cate': [{'property': 'Activity'}, {'property': 'Profile'}], 'field': 'Social Network'},
		{'name': 'Facebook', 'cate': [{'property': 'Profile'}, {'property': 'Activity'}, {'property': 'Friend'}], 'field': 'Social Network'},
	]

	$scope.new_api = function(){
		if(this.new_api_name != null){		
			$scope.apiList.push({'name': this.new_api_name});
			$scope.create_api = false;
			$scope.api_list = true;
		}
		else{
			$scope.new_api_required = true;
		}
	}

	$scope.apiSearch = [];

	$scope.cleanSearch = function(){
		$scope.apiSearch = [];
	}

// ====================== api bottom======================
// ====================== Resource top======================
	$scope.newAccountDialog = function(){
		$scope.account = {
			GoogleDrive: 'GoogleDrive',
			Dropbox: 'Dropbox',
		};
		var modalInstance = $modal.open({
			templateUrl: 'newAccountInfo',
			controller: 'createAccountCrtl',
			size: 'lg',
			resolve:{
		        account: function () {
		          return $scope.account;
      		  }
			}
		});
	}

	$scope.max_cap = 0;
	$scope.change_cap = function(change_cap) {
		$scope.max_cap = $scope.max_cap +change_cap;
		$scope.cap = 4.7;

		$scope.percent = Math.floor(($scope.cap/$scope.max_cap)*1000)/10;

			if($scope.percent<=50){
				$scope.type = "info";
			}
			else if($scope.percent<=80){
				$scope.type = "warning";
			}
			else {
				$scope.type ="danger";
			}	
	}


	$scope.account_list = [];
	$scope.change_cap(5);

	$rootScope.$on('list', function(arg_name, account){
			$scope.account_list.push(account);
			var add_cap =  $scope.account_list[$scope.account_list.length-1].capacity;
			$scope.change_cap(add_cap);
		});

	$scope.del_account = function(del_account) {
		var del_cap = -(del_account.capacity);
		$scope.change_cap(del_cap);
		$scope.account_list.splice($scope.account_list.indexOf(del_account.del_account),1);
	}
	// ====================== Resource bottom======================
});

KamatoControllers.controller('ChannelDetailCrtl', function($scope, $modalInstance, channel, channel_info){
	//傳入被點擊的channel與channel的資料類型Latency,Connectors,Msg,Bot
	$scope.chart_info = [
		{'channel_name': channel.name, 'chart_title': '連接數', 'chart_cate': 'connectors'},
		{'channel_name': channel.name, 'chart_title': '每秒訊息數量', 'chart_cate': 'msgs'}
	];


	$scope.show_chart = function(chart_cate){
		var d = Math.floor((new Date()).getTime()/1000)*1000;         //現在時間(毫秒)
		var temp =[];
		var num = channel[chart_cate];
		for (var i = 1; i <= 60; i++) {
				// var num = Math.floor((Math.random()*100));
				temp.push([d,num]);
					d -= 1000;
			}
		if(chart_cate == "connectors"){
			$scope.connectors= temp;   //傳到channel.html:45, ng-model="data"		
		}
		else if(chart_cate == "msgs"){
			$scope.msgs= temp;   //傳到channel.html:45, ng-model="data"		
		}
		 console.log(temp);
	}

	for(var i in $scope.chart_info){
		var info = $scope.chart_info[i].chart_cate;
		$scope.show_chart(info);
	}
	
	for (var item in channel_info) {
		if (channel_info[item].name == channel.name){
				$scope.show_channel = channel_info[item];
			}
		}

	$scope.userName = 'CeallShih';

	$scope.show_msg = [
		{'user': 'Peter', 'msg':'Hello'}
	];

	$scope.send_msg = function() {
		$scope.show_msg.push({'user': 'CeallShih', 'msg': $scope.input_msg});
		$scope.input_msg = "";
	}
});

KamatoControllers.controller('ChannelInitCrtl', function ($scope, $modalInstance, channel_init, $rootScope){

	$scope.create = function (channel_name, channel_bots){
		var svae_bot=[{name: channel_name}];
			if (channel_name){
				for(var i in channel_bots){
					if(channel_bots[i].checked == true){
						svae_bot.push(channel_bots[i]);   //傳回PlatformCtrl
					}
				}
			$rootScope.$broadcast('bots', svae_bot);
			$modalInstance.dismiss('cancel');		
		}
	}

	$scope.cancel = function (){
		$modalInstance.dismiss('cancel');
	}

	$scope.bots_optional = [
		{'item': 'Preprocessor', 'checked': true},
		{'item': 'History', 'checked': true},
		{'item': 'File Operator', 'checked': false},
		{'item': 'Encryptor', 'checked': false},
		{'item': 'DB Operator', 'checked': false},
		{'item': 'Mail', 'checked': false},
		{'item': 'APP Push', 'checked': false}
	]
	
	$scope.getBotArr = function(bot) {
		bot.checked = !bot.checked;
	};
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


	$scope.auth_array = [];

	$scope.isAuth = function(per){
		this.click = !this.click;
		$scope.isClicked = $scope.auth_array.indexOf(per.name);

		if($scope.isClicked == -1){
			$scope.auth_array.push(per.name);
		}
		else{
			$scope.auth_array.splice($scope.auth_array.indexOf(per.name),1);
			
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


	
	$scope.auth_array = [];

	$scope.isAuth = function(per){
		this.click = !this.click;
		$scope.isClicked = $scope.auth_array.indexOf(per.name);

		if($scope.isClicked == -1){
			$scope.auth_array.push(per.name);
		}
		else{
			$scope.auth_array.splice($scope.auth_array.indexOf(per.name),1);
			
		}
	}
})

// KamatoControllers.controller('PlatformNikeDialogCtrl', function($scope, $http){
// 	$scope.check = true;

// 	$scope.auth_category=[
// 		{"name": "Profile"},
// 		{"name": "Friends"},
// 		{"name": "Activities"},
// 		{"name": "Nutrition"},
// 		{"name": "Sleep"},
// 		{"name": "Physiological"},
// 	]

	
// 	$scope.auth_array = [];

// 	$scope.isAuth = function(per){
// 		this.click = !this.click;
// 		$scope.isClicked = $scope.auth_array.indexOf(per.name);

// 		if($scope.isClicked == -1){
// 			$scope.auth_array.push(per.name);
// 		}
// 		else{
// 			$scope.auth_array.splice($scope.auth_array.indexOf(per.name),1);
			
// 		}
// 	}
// })

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
	
	$scope.auth_array = [];

	$scope.isAuth = function(per){
		this.click = !this.click;
		$scope.isClicked = $scope.auth_array.indexOf(per.click);

		if($scope.isClicked == -1){
			$scope.auth_array.push(per.click);
		}
		else{
			$scope.auth_array.splice($scope.auth_array.indexOf(per.click),1);
			
		}
	}
})


KamatoControllers.controller('PlatformFitbitDialogCtrl', function($scope, $http){


	$scope.auth_category=[
		{"name": "Profile"},
		{"name": "Friends"},
		{"name": "Activities"},
		{"name": "Nutrition"},
		{"name": "Sleep"},
		{"name": "Physiological"},
	]
	
	$scope.auth_array = [];
	$scope.isAuth = function(per){

		this.click = !this.click ;
		$scope.isClicked = $scope.auth_array.indexOf(per.name);

		if($scope.isClicked == -1){
			$scope.auth_array.push(per.name);
		}
		else{
			$scope.auth_array.splice($scope.auth_array.indexOf(per.name),1);
			
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
	
	$scope.auth_array = [];

	$scope.isAuth = function(per){
		this.click = !this.click;
		$scope.isClicked = $scope.auth_array.indexOf(per.name);

		if($scope.isClicked == -1){
			$scope.auth_array.push(per.name);
		}
		else{
			$scope.auth_array.splice($scope.auth_array.indexOf(per.name),1);
			
		}
	}
});

KamatoControllers.controller('createAccountCrtl',function ($scope, $modalInstance, $rootScope){
	$scope.cancel = function (){
		$modalInstance.dismiss('cancel');
	}

	$scope.accounts = [
		{"type": "GoogleDrive"},
		{"type": "Dropbox"},
	]

	$scope.create_account = function($account_type) {
		var num = Math.floor(Math.random()*1000);
		var user_name = 'Ceallshih'+num;
		if($account_type == "GoogleDrive"){
			var account_obj= {name: user_name, capacity: 2.0, account_type: $account_type, status: 'Working', del_account: user_name+ $account_type};
		}
		else if($account_type == "Dropbox"){
			var account_obj = {name: user_name, capacity: 2.0, account_type: $account_type, status: 'Working', del_account: user_name+ $account_type};
		}
		$rootScope.$broadcast('list', account_obj);
		$modalInstance.dismiss('cancel');
	}
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