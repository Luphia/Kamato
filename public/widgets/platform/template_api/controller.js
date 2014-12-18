Kamato.register.controller('apiCtrl', function ($scope, $http, $modal, ngDialog, $rootScope){
// ====================== api top======================
	$scope.resources = [
		{"name": "Facebook"},
		{"name": "GooglePlus"},
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

	$scope.api_list = true;		   //API管理頁面
	$scope.create_api = false;     //隱藏新增API頁面
	$scope.req_chart = false;	   //隱藏API活躍頁面
	$scope.ca_tag = ['sport','running','Nike','running','Runkeeper','sn','google+','sn','fb'];

	$scope.create_api_page = function(){   
	//表單初始化
		$scope.api_list = false;
		$scope.create_api = true;
		// 表單require
		$scope.new_api_required = true;
		$scope.select_rest_mt = true;
		// 表格初始化
		$scope.new_api_name = "";
		$scope.new_tag = "";
		for (var r in $scope.rest_methods){
			$scope.rest_methods[r]['sql'] = "";
			$scope.rest_methods[r]['checked'] = false;
			$scope.rest_methods[r]['required'] = true;
		}
	}

	// $scope.init = function(){

	// }

	// $scope.destory = function(){

	// }

	$scope.return_api_page = function(){
		$scope.api_list = true;
		$scope.create_api = false;
		$scope.req_chart = false;

		//取消require
		$scope.select_rest_mt = false;
		$scope.new_api_required = false;
		// 清空sql指令
		$scope.command_sample = "";
		for (var r in $scope.rest_methods){
			$scope.rest_methods[r]['checked'] = false;
		}
	}

	$scope.show_apiReq_chart = function(){
		$scope.req_chart = true;
		$scope.api_list = false;
	}

	$scope.del_api = function(api){
		$scope.apiList.splice($scope.apiList.indexOf(api),1);
	}

	$scope.api_table_head = [
		{'name': 'API Name'},
		{'name': 'Category'},
		{'name': 'Visible'}, 
		{'name': ''}//delete btn
	]  

	$scope.api_cate = [
		{'name': 'Sport', 'required': true},
		{'name': 'Social Network', 'required': true},
		{'name': 'Weather', 'required': true},
		{'name': 'Goverment', 'required': true},
	]

	$scope.apiList = [
		{'name': 'NikePlus', 'cate': ['sport','running','Nike'], 'visible': 'Public'},
		{'name': 'Runkeeper', 'cate': ['sport','running','Runkeeper'], 'visible': 'Public'},
		{'name': 'GooglePlus', 'cate': ['scocial network','google+'], 'visible': 'Public'},
		{'name': 'Facebook', 'cate': ['sn','fb'], 'visible': 'Public'},
	]

	$scope.apiSearch = [];

	$scope.cleanSearch = function(){
		$scope.apiSearch = [];
	}

	$scope.rest_methods = [
		{'name': 'GET', 'checked': false, 'sql': '', 'required': true},
		{'name': 'POST', 'checked': false, 'sql': '', 'required': true},
		{'name': 'PUT', 'checked': false, 'sql': '', 'required': true},
		{'name': 'DELETE', 'checked': false, 'sql': '', 'required': true},
	]

	$scope.click_checkbox = function(ch_option){
		// 確認是否有勾選REST方法
		var is_click = false;
		for (var c in ch_option){
			//有勾選
			if (ch_option[c].checked == true){
				is_click = true;
			}
		}
		//沒勾選
		if(is_click == false){
			//加入勾選提示
			for (var c in ch_option){
				ch_option[c].required = true;;
			}
		}
		//有勾選
		else{
			//取消勾選提示, 有勾選其中一個選項即可
			for (var c in ch_option){
				ch_option[c].required = false;
			}
		}
	}

	$scope.visible_clicked = "Public";
	$scope.api_public = function(name){
		$scope.visible_clicked = name;
	}

	$scope.new_tag="";

	// $scope.ca_tag_keyup = function(e){
	// 	//press enter
	// 	if(e.keyCode == 13){
	// 		var tag = $scope.new_tag;

	// 	}
	// }

	$scope.typing_tag = false;
	$scope.api_submit = function() {
	// 送出表單
		if( $scope.typing_tag == false ){
			$scope.apiList.push({'name': this.new_api_name, 'cate': [$scope.new_tag], 'visible': $scope.visible_clicked});
			$scope.create_api = false;
			$scope.api_list = true;
		}
	}

// 	$scope.formA = {};
// $scope.tags = [{"name":"a"},{"name":"b"}];	
// $scope.addTag = function(tag) {
// 	$scope.tags.push({"name":tag});
// 	$scope.new_tag = '';
// };//--
// ====================== api bottom======================	
});