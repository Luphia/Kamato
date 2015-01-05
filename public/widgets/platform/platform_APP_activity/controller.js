Kamato.register.controller('appActivityCtrl', function ($scope, $http, $modal, ngDialog, $rootScope, $timeout, $routeParams) {
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
		{ 'tip': 'Activity', 'icon': 'sa-list-activity', 'link': '#/platform/APP/' + $routeParams.APP + '/APP_activity' },
		{ 'tip': 'Info.', 'icon': 'sa-list-info', 'link': '#/platform/APP/' + $routeParams.APP + '/APP_info' },		// {'tip': 'Upload', 'icon': 'sa-list-upload', 'link': '#/platform/APP/upload'}
 		{ 'tip': 'Folder', 'icon': 'sa-list-folder', 'link': '#/platform/APP/' + $routeParams.APP + '/APP_folder' },
    ];
    // ====================== APP管理 bottom======================
    $scope.app_info = [
        {
            online: 0,
            total: 0,
            network: { in: 0, out: 0 },
            online_history: 0,
            network_history: { in: 0, out: 0 }
        }
    ];
    var users_data = []
    var dataset_users;

    var networks_datain = [];
    var networks_dataout = [];

    var dataset_networks;

    var updateInterval = 1000;

    //when leave this page than clear timer
    $scope.$on("$destroy", function () {
        socket.disconnect();
        socket.removeAllListeners();
    });

    var socket = io('https://simple.tanpopo.cc/' + $routeParams.APP, { autoConnect: false, secure: true });
    socket.on('connect', function () {
        console.log('123')
        //update();
    });
    socket.on('disconnect', function (data) {
        //socket.connect();
    });

    // 初始化資料
    socket.on('summary', function (data) {
        if ($('.main-chart').length > 0) {
            $scope.app_info[0].online = data.current.session;
            $scope.app_info[0].network.in = data.current.in;
            $scope.app_info[0].network.out = data.current.out;            

            var netin = data.history.in;    //300
            var netout = data.history.out;  //300
            var session = data.history.session; //300

            var myDate = new Date().getTime();

            var wanttime = myDate - (5 * 60 * 1000);
            wanttime = new Date(wanttime).getTime();
            var total = 0;
            for (var i = 0; i < 300; i++) {
                var x = netin[i];
                var y = netout[i];
                var z = session[i];
                total += z;
                wanttime += 1000;

                var netintemp = [wanttime, x];
                networks_datain.push(netintemp);

                var netouttemp = [wanttime, y];
                networks_dataout.push(netouttemp);

                var sessiontemp = [wanttime, z];
                users_data.push(sessiontemp);

                $scope.app_info[0].total = total;
            };
            $scope.$apply();
        };
    });

    socket.on('data', function (data) {
        var din = data.in;
        var dout = data.out;
        var dsession = data.session;

        $scope.app_info[0].online = dsession;
        $scope.app_info[0].network.in = din;
        $scope.app_info[0].network.out = dout;
        $scope.$apply();

        if ($('.main-chart').length > 0) {
            Get_Data(dsession, din, dout);
            $.plot($("#Users"), dataset_users, options1);
            $.plot($("#Networks"), dataset_networks, options2)
        };
    });

    $scope.init = function () {
        dataset_users = [{ label: "線上用戶", data: users_data }];
        $.plot($("#Users"), dataset_users, options1);
        dataset_networks = [{ label: "網路流量(IN)", data: networks_datain, color: '#08F' }, { label: "網路流量(OUT)", data: networks_dataout, color: '#5C6' }];
        $.plot($("#Networks"), dataset_networks, options2);
        socket.connect();
    };

    function Get_Data(num, nin, nout) {
        users_data.shift();
        networks_datain.shift();
        networks_dataout.shift();

        var x = nin;
        var y = nout;
        var z = num;

        var now = new Date();

        var tempx = [now, x];
        var tempy = [now, y];
        var tempz = [now, z];

        networks_datain.push(tempx);
        networks_dataout.push(tempy);
        users_data.push(tempz);
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
        colors: ['rgba(255,255,255,0.3)'],
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
                fillColor: { colors: [{ opacity: 0.3 }, { opacity: 0.3 }] }
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

});