Kamato.register.controller('appCtrl', function ($scope, $http, $modal, ngDialog, $rootScope) {
    // ====================== APP管理 top======================
    $scope.app_oper = [
		// {'tip': 'Home', 'icon': 'sa-list-home'},
		{ 'tip': 'Back', 'icon': 'sa-list-back', 'link': '#/platform/APP' },
	    { 'tip': 'Activity', 'icon': 'sa-list-activity', 'link': '#/platform/APP/activity' },
		{ 'tip': 'Info.', 'icon': 'sa-list-info', 'link': '#/platform/APP/info' },
	    { 'tip': 'Folder', 'icon': 'sa-list-folder', 'link': '#/platform/APP/folder' },
		// {'tip': 'Upload', 'icon': 'sa-list-upload', 'link': '#/platform/APP/upload'}
    ];

    $scope.create_app = false;
    $scope.new_app_required = false;
    $scope.change_page = function () {
        $scope.new_app_required = false;
        $scope.create_app = !$scope.create_app;
    }

    $scope.new_app = function () {
        if (this.new_app_name != null) {
            var datas = { 'name': this.new_app_name };

            $http({
                method: 'POST',
                url: './manage/api/',
                data: datas
            }).success(function (data, status, headers, config) {
                if (data.result == 1) {
                    $scope.appList.splice(0, 0, datas);
                    $scope.create_app = !$scope.create_app;
                } else {
                    alert('Please change your api name');
                };
            }).error(function (data, status, headers, config) {

            });
        }
        else {
            $scope.new_app_required = true;
        }
    }

    $scope.appSearch = [];

    $scope.cleanSearch = function () {
        $scope.appSearch = [];
    }

    $scope.init = function () {
        //載入後端資料
        $http({
            method: 'GET',
            url: './manage/api/'
        }).success(function (data, status, headers, config) {
            $scope.appList = data.data.list;
            $scope.create_app = false;
            $scope.new_app_required = true;
        }).error(function (data, status, headers, config) {

        });

    };
    
    $scope.del_app = function (app) {
        //刪除後端資料
        var name = app.name;        //傳入api名稱
        var id = app._id;        //傳入api id

        $http({
            method: 'DELETE',
            url: './manage/api/' + id,
        }).success(function (data, status, headers, config) {
            if (data.result == 1) {
                $scope.appList.splice($scope.appList.indexOf(app), 1);
            } else {
                alert('error');
            };
        }).error(function (data, status, headers, config) {

        });

    };

    $scope.appList = [];

    // ====================== APP管理 bottom======================

});