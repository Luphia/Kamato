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
        //readBlob(elem.files);
        var aa = new EasyFile();
        aa.setCallback(function (err, data) {
            console.log('err:' + err + ', data:' + data);
        });

        var files = elem.files;
        if (!files.length) {
            alert('Please select a file!');
            return;
        };
        var file = files[0];
        //aa.loadFile(file);
        //console.log(aa.toJSON());
        //aa.toBase64(function (cb) {
        //console.log(cb)
        //});
        //aa.split(50);
        //console.log(aa.getSlice(1));
        //console.log(aa.getSlice(2));

        //var reader = new FileReader();
        //reader.onloadend = function (e) {
        //    if (e.target.readyState == FileReader.DONE) {
        //        var blob = String(e.target.result).split(';base64,')[1];

        function test() {
            var a = 0;
            for (var i = 0; i < 10000; i++) {
                var start = 0;
                var end = 0;

                start = new Date().getTime();
                aa.loadFile(file);
                aa.split(10 * 1024 * 1000);
                end = new Date().getTime();
                a += (end - start) / 1000;
                console.log((end - start) / 1000 + "sec");
            };
            console.log('總和' + a)
        };

        test();
        //aa.split(10240);
        console.log(aa.getSlice(1));
        //console.log(aa.done(1));

        //        aa.loadFile(blob, file.name, file.type, file.size);
        //        console.log(aa.toBlob())
        //        //aa.split(500);
        //        //console.log(aa.countSlice())
        //        //console.log(aa.getSlice(1))

        //        //console.log(aa.getSlice(2))
        //        //console.log(aa.getSlice(3))

        //        //aa.done(1);

        //        //console.log(aa.getSliceID(1));
        //        //console.log(aa.getSliceID(0));

        //        //var bb = new EasyFile();
        //        //bb.setCallback(function (err, data) {
        //        //    console.log('err:' + err + ', data:' + data);
        //        //});
        //        //var data1 = {
        //        //    blob: "123+456",
        //        //    id: "79b7734af46b30c91db8a9d587f3b1bcf664c7bb_1_2_4215448069",
        //        //    sha1: "79b7734af46b30c91db8a9d587f3b1bcf664c7bb",
        //        //    type: "EasyFile"
        //        //}
        //        //var data2 = {
        //        //    blob: "+789+101112",
        //        //    id: "79b7734af46b30c91db8a9d587f3b1bcf664c7bb_2_2_4215448069",
        //        //    sha1: "79b7734af46b30c91db8a9d587f3b1bcf664c7bb",
        //        //    type: "EasyFile"
        //        //}
        //        //bb.addSlice(data1);
        //        //bb.addSlice(data2);
        //        //console.log(bb.toJSON());

        //    };
        //};
        //reader.readAsDataURL(file);

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