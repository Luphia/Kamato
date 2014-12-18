Kamato.register.controller('appActivityCtrl', function ($scope, $http, $modal, ngDialog, $rootScope){
// ====================== APP管理 top======================
	$scope.app_oper = [
		// {'tip': 'Home', 'icon': 'sa-list-home'},
		{'tip': 'Back', 'icon': 'sa-list-back', 'link': '#/platform/APP'},
		{'tip': 'Folder', 'icon': 'sa-list-folder', 'link': '#/platform/APP_folder'},
		{'tip': 'Activity', 'icon': 'sa-list-activity', 'link': '#/platform/APP_activity'},
		{'tip': 'Info.', 'icon': 'sa-list-info','link': '#/platform/APP_info'},		// {'tip': 'Upload', 'icon': 'sa-list-upload', 'link': '#/platform/APP/upload'}
	];
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

// ====================== APP管理 bottom======================

});