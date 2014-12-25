Kamato.register.controller('appCtrl', function ($scope, $http, $modal, ngDialog, $rootScope) {
    // ====================== APP管理 top======================
    $scope.app_oper = [
		// {'tip': 'Home', 'icon': 'sa-list-home'},
		{ 'tip': 'Back', 'icon': 'sa-list-back', 'link': '#/platform/APP' },
		{ 'tip': 'Folder', 'icon': 'sa-list-folder', 'link': '#/platform/APP/folder' },
		{ 'tip': 'Activity', 'icon': 'sa-list-activity', 'link': '#/platform/APP/activity' },
		{ 'tip': 'Info.', 'icon': 'sa-list-info', 'link': '#/platform/APP/info' },
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
            $scope.appList.push({ 'name': this.new_app_name });
            $scope.create_app = !$scope.create_app;
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
            $scope.appList.splice($scope.appList.indexOf(app), 1);
        }).error(function (data, status, headers, config) {

        });

    };

    $scope.appList = [];

    $scope.fileNameChange = function (elem) {
        $scope.files = elem.files;
        $scope.$apply();
    }

    $scope.test_file = {
        'Path': 'public/',
        'files': [
            { 'datatype': 'folder', 'name': 'css', 'icon': 'sa-list-folder', 'file_size': '', 'Last_revise': '2014/11/25' },
            { 'datatype': 'folder', 'name': 'js', 'icon': 'sa-list-folder', 'file_size': '', 'Last_revise': '2014/11/25' },
            { 'datatype': 'folder', 'name': 'lib', 'icon': 'sa-list-folder', 'file_size': '', 'Last_revise': '2014/11/25' },
            { 'datatype': 'folder', 'name': 'simple', 'icon': 'sa-list-folder', 'file_size': '', 'Last_revise': '2014/11/25' },
            { 'datatype': 'folder', 'name': 'widget', 'icon': 'sa-list-folder', 'file_size': '', 'Last_revise': '2014/11/25' },
            { 'datatype': 'html', 'name': 'index.html', 'icon': 'sa-list-file', 'file_size': '234kb', 'Last_revise': '2014/11/25' },
            { 'datatype': 'txt', 'name': 'README.md', 'icon': 'sa-list-file', 'file_size': '234kb', 'Last_revise': '2014/11/25' },
        ],
    }


    $scope.daily_req = function (reqs) {    //傳入一個陣列, 包含30內天的req值
        var d = Math.floor((new Date()).getTime() / 1000) * 1000;         //現在時間(毫秒)
        var temp = [];
        for (var i = 0; i < 30; i++) {
            // var num = Math.floor((Math.random()*100));
            temp.push([d, reqs[i]]);            //e.g. [[x1,y1],[x2,y2]]
            d -= 86400000;             //毫秒
        }
        $scope.Request = temp;
    }


    var reqs = [324, 324, 255, 466, 523, 43, 43, 23, 123, 43, 24, 359, 345, 45, 543, 43, 234, 755, 234, 74, 77, 231, 324, 34, 653, 853, 63, 61, 86, 245]
    $scope.daily_req(reqs);

    $scope.app_info_tab = [
		{ 'name': 'View Detail' },
		{ 'name': 'APP Developers' }
    ]

    $scope.tab_name = 'View Detail';

    $scope.click = function (name) {
        $scope.app_nav = name;
    }

    $scope.tab_clicked = function (name) {
        $scope.tab_name = name;
    }

    $scope.app_info = [
		{ 'name': 'APP name', 'type': 'text', 'tooltip': 'APP名稱' },
		{ 'name': 'Website', 'type': 'url', 'tooltip': '管理頁面網址  ( Ex: http://...)' },
		{ 'name': 'Owner', 'type': 'text', 'tooltip': 'APP開發者, 擁有開發APP所有權限' },
		{ 'name': 'Collaborator', 'type': 'text', 'tooltip': 'APP共同開發者, 擁有大部分權限, 但無法新增、刪除其他開發者與APP' },
		{ 'name': 'Support Email', 'type': 'email', 'tooltip': '聯絡資訊' }
    ]
    // ====================== APP管理 bottom======================

});