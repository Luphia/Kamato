'use strict';

/* Controllers */
var KamatoControllers = angular.module('KamatoControllers', ['ngDialog', 'ui.bootstrap']);




KamatoControllers.controller('PlatformCtrl', function ($scope, $http, $modal, ngDialog, $rootScope) {

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