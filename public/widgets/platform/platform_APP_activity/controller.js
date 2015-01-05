Kamato.register.controller('appActivityCtrl', function ($scope, $http, $modal, ngDialog, $rootScope, $timeout, $routeParams) {

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
    var start = false;

    $scope.$on("$destroy", function () {
        socket.disconnect();
        socket.removeAllListeners();
    });

    var socket = io('https://simple.tanpopo.cc/' + $routeParams.APP, { autoConnect: false, secure: true });
    socket.on('connect', function () {
    });
    socket.on('disconnect', function (data) {
    });

    // 初始化資料
    socket.on('summary', function (data) {
        if ($('.main-chart').length > 0 && start == false) {
            var netin = data.history.in.reverse();
            var netout = data.history.out.reverse();
            var session = data.history.session.reverse();

            var total = 0;
            for (var i = 0; i < 300; i++) {
                var x = netin[i][0];
                var xx = netin[i][1];
                var y = netout[i][0];
                var yy = netout[i][1];
                var z = session[i][0];
                var zz = session[i][1];

                total += z;

                var netintemp = [xx, x];
                networks_datain.push(netintemp);

                var netouttemp = [yy, y];
                networks_dataout.push(netouttemp);

                var sessiontemp = [zz, z];
                users_data.push(sessiontemp);
            };

            $scope.app_info[0].online = data.current.session[0];
            $scope.app_info[0].network.in = displayByte(data.current.in[0], 'B');
            $scope.app_info[0].network.out = displayByte(data.current.out[0], 'B');
            $scope.app_info[0].total = total;
            $scope.$apply();
            start = true;

        };
    });

    socket.on('data', function (data) {
        if ($('.main-chart').length > 0 && start == true) {
            var din = data.in;
            var dout = data.out;
            var dsession = data.session;

            Get_Data(dsession, din, dout);
            $.plot($("#Users"), dataset_users, options1);
            $.plot($("#Networks"), dataset_networks, options2);
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
        var x = nin[0];
        $scope.app_info[0].network.in = displayByte(x, 'B');

        var xx = nin[1];
        var y = nout[0];
        $scope.app_info[0].network.out = displayByte(y, 'B');

        var yy = nout[1];
        var z = num[0];
        $scope.app_info[0].online = z;

        var zz = num[1];

        var tempx = [xx, x];
        var tempy = [yy, y];
        var tempz = [zz, z];

        users_data.shift();
        networks_datain.shift();
        networks_dataout.shift();

        networks_datain.push(tempx);
        networks_dataout.push(tempy);
        users_data.push(tempz);
        $scope.$apply();

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
                var data = displayByte(v, 'B');
                return data[0] + data[1];
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