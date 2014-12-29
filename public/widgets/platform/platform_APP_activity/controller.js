Kamato.register.controller('appActivityCtrl', function ($scope, $http, $modal, ngDialog, $rootScope) {
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

    // ====================== APP管理 top======================
    $scope.app_oper = [
		// {'tip': 'Home', 'icon': 'sa-list-home'},
		{ 'tip': 'Back', 'icon': 'sa-list-back', 'link': '#/platform/APP' },
		{ 'tip': 'Activity', 'icon': 'sa-list-activity', 'link': '#/platform/APP_activity' },
		{ 'tip': 'Info.', 'icon': 'sa-list-info', 'link': '#/platform/APP_info' },		// {'tip': 'Upload', 'icon': 'sa-list-upload', 'link': '#/platform/APP/upload'}
 		{ 'tip': 'Folder', 'icon': 'sa-list-folder', 'link': '#/platform/APP_folder' },
    ];
    // ====================== APP管理 bottom======================

    var data = [];
    var dataset;
    var updateInterval = 1000;

    $scope.init = function () {
        Get600Data();
        dataset = [{ label: "線上用戶量", data: data }];
        $.plot($("#Users"), dataset, options);
        update();
    };

    function Get600Data() {
        data.shift();

        var myDate = new Date().getTime();
        var wanttime = myDate - (10 * 60 * 1000);
        wanttime = new Date(wanttime).getTime();

        for (var i = 0; i < 600; i++) {
            var y = getRandom(0, 1000);
            var temp = [wanttime += 1000, y];
            data.push(temp);
        };
    };

    function GetData() {
        data.shift();
        var y = getRandom(0, 1000);
        var now = new Date()//.getTime();
        var temp = [now, y];
        data.push(temp);
    };

    var options = {
        series: {
            lines: {
                show: true,
                lineWidth: 1.2,
                fill: true,
                shadowSize: 0
            }
        },
        xaxis: {
            mode: "time",
            //tickSize: [10, "second"],
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
            },
            font: {
                lineHeight: 13,
                style: "normal",
                color: "rgba(255,255,255,0.8)",
            }
        },
        yaxis: {
            tickFormatter: function (v, axis) {
                return v + "";
            },
            font: {
                lineHeight: 13,
                style: "normal",
                color: "rgba(255,255,255,0.8)",
            }
        },
        legend: {
            labelBoxBorderColor: "#fff"
        }
    };

    function update() {
        GetData();
        $.plot($("#Users"), dataset, options)
        setTimeout(update, updateInterval);
    };

});