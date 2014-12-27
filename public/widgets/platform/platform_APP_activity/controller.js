Kamato.register.controller('appActivityCtrl', function ($scope, $http, $modal, ngDialog, $rootScope) {


    //var plot;
    //var data = [{ data: [] }];
    //var options = {
    //    series: {
    //        lines: { show: true },
    //        points: { show: false }
    //    },
    //    xaxis: {
    //        mode: "time",
    //        timezone: "browser"
    //    }
    //};

    //$scope.init = function () {
    //    plot = $.plot("#Request", data, options);
    //    //plot.setupGrid();
    //    //plot.draw();
    //    fetchData();
    //};
    //隨機產生
    function getRandom(minNum, maxNum) {	//取得 minNum(最小值) ~ maxNum(最大值) 之間的亂數
        return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    };
    function getRandomArray(minNum, maxNum, n) {	//隨機產生不重覆的n個數字
        var rdmArray = [n];		//儲存產生的陣列

        for (var i = 0; i < n; i++) {
            var rdm = 0;		//暫存的亂數

            do {
                var exist = false;			//此亂數是否已存在
                rdm = getRandom(minNum, maxNum);	//取得亂數

                //檢查亂數是否存在於陣列中，若存在則繼續回圈
                if (rdmArray.indexOf(rdm) != -1) exist = true;

            } while (exist);	//產生沒出現過的亂數時離開迴圈

            rdmArray[i] = rdm;
        };
        return rdmArray;
    };

    //var iteration = 0;

    //function fetchData() {
    //    ++iteration;

    //    var time = Math.floor((new Date()).getTime() / 1000) * 1000;
    //    var dd = [time, getRandom(0, 200)];
    //    data[0].data.push(dd);
    //    plot = $.plot("#Request", data, options);
    //    plot.setData([
    //      {
    //          label: '每10秒更新',
    //          data: data[0].data,
    //      }
    //    ]);
    //    plot.setupGrid();
    //    plot.draw();

    //    //function onDataReceived(series) {
    //    //    data[0].data.push(series);
    //    //    $.plot("#Request", data, options);
    //    //}

    //    //var time = Math.floor((new Date()).getTime() / 1000) * 1000;
    //    //var dd = [time, getRandom(0, 200)];

    //    //onDataReceived(dd);

    //    if (iteration < 600) {
    //        setTimeout(fetchData, 1000);
    //    } else {
    //        //data = [];
    //        //alreadyFetched = {};
    //    }
    //}


    // ====================== APP管理 top======================
    $scope.app_oper = [
		// {'tip': 'Home', 'icon': 'sa-list-home'},
		{ 'tip': 'Back', 'icon': 'sa-list-back', 'link': '#/platform/APP' },
		{ 'tip': 'Folder', 'icon': 'sa-list-folder', 'link': '#/platform/APP_folder' },
		{ 'tip': 'Activity', 'icon': 'sa-list-activity', 'link': '#/platform/APP_activity' },
		{ 'tip': 'Info.', 'icon': 'sa-list-info', 'link': '#/platform/APP_info' },		// {'tip': 'Upload', 'icon': 'sa-list-upload', 'link': '#/platform/APP/upload'}
    ];
    // ====================== APP管理 bottom======================

    var data = [];
    var dataset;
    var totalPoints = 590;
    var updateInterval = 1000;
    //var now = new Date().getTime();

    $scope.init = function () {
        Get600Data();
        dataset = [{ label: "線上用戶量", data: data }];
        $.plot($("#Request"), dataset, options);
        update();
    };

    function Get600Data() {
        data.shift();
        var now = 1419660013792;

        for (var i = 0; i < 600; i++) {
            var y = getRandom(0, 100);
            var temp = [now += 1000, y];
            data.push(temp);
        };
        console.log(data)
    };

    function GetData() {
        data.shift();
        while (data.length < totalPoints) {
            var y = getRandom(0, 100);
            var now = new Date().getTime();
            var temp = [now, y];
            data.push(temp);
        };
    };

    var options = {
        series: {
            lines: {
                show: true,
                lineWidth: 1.2,
                fill: true
            }
        },
        xaxis: {
            mode: "time",
            tickFormatter: function (v, axis) {
                var date = new Date(v);
                if (date.getSeconds() % 10 == 0) {
                    var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
                    var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                    var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
                    return minutes + ":" + seconds;
                } else {
                    return "";
                };
            }
        },
        yaxis: {
            tickFormatter: function (v, axis) {
                return v + "位";
            },
        },
        legend: {
            labelBoxBorderColor: "#fff"
        }
    };

    function update() {
        GetData();
        $.plot($("#Request"), dataset, options)
        setTimeout(update, updateInterval);
    };

});