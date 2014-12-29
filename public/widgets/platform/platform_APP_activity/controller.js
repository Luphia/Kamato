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
    $scope.app_info = [
        {
            online: '123456',
            total: '987654321',
            network: { in: '00', out: '00' },
            online_history: '12345',
            network_history: { in: '00', out: '00' }
        }
    ];
    var users_data = []
    var dataset_users;

    var networks_datain = [];
    var networks_dataout = [];

    var dataset_networks;

    var updateInterval = 1000;

    $scope.init = function () {
        Get600Data();

        dataset_users = [{ label: "線上用戶", data: users_data }];
        $.plot($("#Users"), dataset_users, options1);
        update_users();

        dataset_networks = [{ label: "網路流量(IN)", data: users_data, color: '#08F' }, { label: "網路流量(OUT)", data: networks_dataout, color: '#5C6' }];
        $.plot($("#Networks"), dataset_networks, options2);
        update_networks();
    };

    function Get600Data() {
        users_data.shift();
        var myDate = new Date().getTime();
        var wanttime = myDate - (5 * 60 * 1000);
        wanttime = new Date(wanttime).getTime();
        for (var i = 0; i < 300; i++) {
            var y = getRandom(0, 5000);
            var temp = [wanttime += 1000, y];
            users_data.push(temp);
            networks_datain.push(temp);
            networks_dataout.push(temp);
        };
    };

    function Get_usersData() {
        users_data.shift();
        var y = getRandom(4000, 5000);
        var now = new Date()//.getTime();
        var temp = [now, y];
        users_data.push(temp);
    };

    function Get_networksData() {
        networks_datain.shift();
        networks_dataout.shift();
        var y = getRandom(0, 3000);
        var now = new Date()//.getTime();
        var temp = [now, y];
        networks_datain.push(temp);
        networks_dataout.push(temp);
    };

    var options1 = {
        series: {
            lines: {
                show: true,
                lineWidth: 1.2,
                fill: true,
                shadowSize: 0
            }
        },
        colors: ['rgba(255,255,255,1)'],
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
                color: "rgba(255,255,255,1)",
            }
        },
        yaxis: {
            tickFormatter: function (v, axis) {
                return v + "";
            },
            font: {
                lineHeight: 13,
                style: "normal",
                color: "rgba(255,255,255,1)",
            }
        },
        legend: {
            labelBoxBorderColor: "#fff"
        },
        grid: {
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.25)',
            labelMargin: 10,
            mouseActiveRadius: 6,
        },
    };

    var options2 = {
        series: {
            lines: {
                show: true,
                lineWidth: 1.2,
                fill: 1,
                fillColor: { colors: [{ opacity: 1.0 }, { opacity: 1.0 }] }
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
                color: "rgba(255,255,255,1)",
            }
        },
        yaxis: {
            tickFormatter: function (v, axis) {
                return v + "";
            },
            font: {
                lineHeight: 13,
                style: "normal",
                color: "rgba(255,255,255,1)",
            }
        },
        legend: {
            labelBoxBorderColor: "#fff"
        },
        grid: {
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.25)',
            labelMargin: 10,
            mouseActiveRadius: 6,
        },
    };

    function update_users() {
        if ($('.main-chart').length > 0) {
            Get_usersData();
            $.plot($("#Users"), dataset_users, options1)
            setTimeout(update_users, updateInterval);
        };
    };
    function update_networks() {
        if ($('.main-chart').length > 0) {
            Get_networksData();
            $.plot($("#Networks"), dataset_networks, options2)
            setTimeout(update_networks, updateInterval);
        };
    };

});