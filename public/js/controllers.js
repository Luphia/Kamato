'use strict';

/* Controllers */
var KamatoControllers = angular.module('KamatoControllers', ['ngDialog', 'ui.bootstrap']);

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