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

    function readBlob(files, opt_startByte, opt_stopByte) {

        //var files = document.getElementById('files').files;
        if (!files.length) {
            alert('Please select a file!');
            return;
        }

        var file = files[0];
        var start = parseInt(opt_startByte) || 0;
        var stop = parseInt(opt_stopByte) || file.size - 1;

        var reader = new FileReader();

        // If we use onloadend, we need to check the readyState.
        reader.onloadend = function (evt) {

            if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                document.getElementById('byte_content').textContent = evt.target.result;
                console.log(evt.target.result)

                document.getElementById('byte_range').textContent =
                    ['Read bytes: ', start + 1, ' - ', stop + 1,
                     ' of ', file.size, ' byte file'].join('');
            }
        };

        var blob = file.slice(start, stop + 1);
        reader.readAsText(blob);
    };

    $scope.fileNameChange = function (elem) {
        console.log(elem.files);
        //readBlob(elem.files);

        var aa = new EasyFile();

        var files = elem.files;
        if (!files.length) {
            alert('Please select a file!');
            return;
        };
        var file = files[0];

        var reader = new FileReader();
        reader.onloadend = function (e) {
            if (e.target.readyState == FileReader.DONE) {
                aa.loadFile(e.target.result, file.name, file.type, file.size);
                aa.split(50);
                console.log(aa.getSlice(1))
                console.log(aa.getSlice(2))
                console.log(aa.getSlice(3))
            };
        };
        reader.readAsDataURL(file);

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