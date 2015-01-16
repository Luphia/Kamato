Kamato.register.controller('appFolderCtrl', function ($scope, $http, $modal, ngDialog, $rootScope, $routeParams) {
    // ====================== APP管理 top======================
    $scope.app_oper = [
		// {'tip': 'Home', 'icon': 'sa-list-home'},
		{ 'tip': 'Back', 'icon': 'sa-list-back', 'link': '#/platform/APP' },
		{ 'tip': 'Activity', 'icon': 'sa-list-activity', 'link': '#/platform/APP/' + $routeParams.APP + '/APP_activity' },
		{ 'tip': 'Info.', 'icon': 'sa-list-info', 'link': '#/platform/APP/' + $routeParams.APP + '/APP_info' },
		{ 'tip': 'Folder', 'icon': 'sa-list-folder', 'link': '#/platform/APP/' + $routeParams.APP + '/APP_folder' },
		// {'tip': 'Upload', 'icon': 'sa-list-upload', 'link': '#/platform/APP/upload'}
    ];

    var socket = io('https://localhost/_file', { autoConnect: true, secure: true });
    var currentFile = null;
    var currentFileReader = null;

    var FReader;
    var Name;
    var MB;
    function StartUpload() {
        if (SelectedFile) {
            FReader = new FileReader();
            Name = SelectedFile.name;
            MB = Math.round(SelectedFile.size / 1048576);
            FReader.onload = function (evnt) {
                socket.emit('Upload', { 'Name': Name, Data: evnt.target.result });
            };
            socket.emit('Start', { 'Name': Name, 'Size': SelectedFile.size });
        } else {
            alert("Please Select A File");
        };
    };
    var SelectedFile;

    socket.on('MoreData', function (data) {
        UpdateBar(data['Percent']);
        var Place = data['Place'] * 524288; //The Next Blocks Starting Position
        var NewFile = SelectedFile.slice(Place, Place + Math.min(524288, (SelectedFile.size - Place)));
        FReader.readAsBinaryString(NewFile);
    });
    function UpdateBar(percent) {
        document.getElementById('progress2').style.width = percent + '%';
        var MBDone = Math.round(((percent / 100.0) * SelectedFile.size) / 1048576);
        $('#progress2').text(Math.round(percent * 100) / 100 + '%   -' + MBDone + 'MB');
    };

    socket.on('Done', function (data) {
        $('#progress2').text('100%   -' + MB + 'MB');
        console.log('Files Successfully Uploaded !!');
    });
    function Refresh() {
        location.reload(true);
    };

    $scope.fileNameChange = function (elem) {
        var aa = new EasyFile();
        aa.setCallback(function (err, data) {
            console.log('err:' + err + ', data:' + data);
        });

        SelectedFile = elem.files[0];
        StartUpload();

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
    // ====================== APP管理 bottom======================

});