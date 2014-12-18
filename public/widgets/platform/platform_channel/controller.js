Kamato.register.controller('channelCtrl', function ($scope, $http, $modal, ngDialog, $rootScope){
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
});
Kamato.register.controller('ChannelDetailCrtl', function($scope, $modalInstance, channel, channel_info){
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

Kamato.register.controller('ChannelInitCrtl', function ($scope, $modalInstance, channel_init, $rootScope){

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