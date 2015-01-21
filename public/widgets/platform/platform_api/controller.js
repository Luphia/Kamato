Kamato.register.controller('apiCtrl', function ($scope, $http, $modal, ngDialog, $rootScope) {

    // ====================== api top======================
    $scope.resources = [
		{ "name": "Facebook" },
		{ "name": "GooglePlus" },
		{ "name": "RunKeeper" },
		{ "name": "Fitbit" },
		{ "name": "Jawbone" },
    ];

    $scope.openDialog = function (resource_name) {
        switch (resource_name) {
            case "Facebook":
                ngDialog.open({
                    template: 'fb_login_permission',
                    controller: 'PlatformFbDialogCtrl'
                });
                break;

            case "GooglePlus":
                ngDialog.open({
                    template: 'GooglePlus_login_permission',
                    controller: 'PlatformGoogleDialogCtrl'
                });
                break;

            case "RunKeeper":
                ngDialog.open({
                    template: 'RunKeeper_login_permission',
                    controller: 'PlatformRKDialogCtrl'
                });
                break;

            case "Fitbit":
                ngDialog.open({
                    template: 'Fitbit_login_permission',
                    controller: 'PlatformFitbitDialogCtrl'
                });
                break;

            case "Jawbone":
                ngDialog.open({
                    template: 'Jawbone_login_permission',
                    controller: 'PlatformJawboneDialogCtrl'
                });
                break;
        }

    }

    $scope.appname = 'iii';        //所屬APP名稱
    $scope.types = 'sql';          //設定該頁type
    $scope.warn_hint = false;      //select type
    var api_link = './manage/api/' + $scope.appname + '/';
    var viewing_api;
    $scope.api_types = function (name) {
        $scope.types = name;
        switch (name) {
            case 'sql':
                $scope.api_list = false;
                $scope.create_api = true;
                // 表單require
                $scope.new_api_required = true;
                $scope.select_rest_mt = true;
                // 表格初始化
                $scope.new_api_name = "";
                $scope.new_tag = "";
                for (var r in $scope.rest_methods) {
                    $scope.rest_methods[r]['sql'] = "";
                    $scope.rest_methods[r]['checked'] = false;
                    $scope.rest_methods[r]['required'] = true;
                };
                $scope.warn_hint = false;
                break;
            case 'outer':
                $scope.api_list = false;
                $scope.create_api = false;

                $scope.select_rest_mt = false;
                $scope.new_api_required = false;

                for (var r in $scope.rest_methods) {
                    $scope.rest_methods[r]['sql'] = "";
                    $scope.rest_methods[r]['checked'] = false;
                    $scope.rest_methods[r]['required'] = false;
                    $scope.rest_methods[r]['diabled'] = true;
                };

                $scope.rest_methods[0]['checked'] = true;

                $scope.api_outer = true;
                $scope.warn_hint = false;
                break;
        };
    };

    $scope.close_warn_hint = function(){
        $scope.warn_hint = false;
    }

    $scope.api_outer = false;      //outer api page

    $scope.api_list = true;		   //API管理頁面
    $scope.create_api = false;     //隱藏新增API頁面
    $scope.req_chart = false;	   //隱藏API活躍頁面
    $scope.ca_tag = ['sport', 'running', 'Nike', 'running', 'Runkeeper', 'sn', 'google+', 'sn', 'fb'];

    $scope.init = function () {
        //載入後端資料
        var app = $scope.appname;   //傳入所屬app名稱

        $http({
            method: 'GET',
            url: './manage/api/' + app
        }).success(function (data, status, headers, config) {
            $scope.apiList = data.data.list;
            $scope.create_api = false;
            $scope.api_list = true;
        }).error(function (data, status, headers, config) {

        });

    };

    $scope.create_api_page = function () {
        //表單初始化
        $scope.warn_hint = true;
    }

    $scope.return_api_page = function () {
        $scope.api_list = true;
        $scope.create_api = false;
        $scope.req_chart = false;
        $scope.api_outer = false;
        $scope.api_desc = "";

        //取消require
        $scope.select_rest_mt = false;
        $scope.new_api_required = false;
        // 清空sql指令
        $scope.command_sample = "";
        for (var r in $scope.rest_methods) {
            $scope.rest_methods[r]['checked'] = false;
        }
    }

    $scope.show_apiReq_chart = function (api_name) {
        var api_list_array;
        viewing_api = api_name;
        $scope.req_chart = true;
        $scope.api_list = false;
        $http.get(api_link+ api_name).success(function(api_list_obj){
            api_list_array = api_list_obj.data.list;
            for ( var i in api_list_array){
                if(api_list_array[i].name == api_name){
                    $scope.api_info = api_list_array[i];
                    console.log($scope.api_info);
                }
            }
        });
    }


    $scope.rewrite_api_info = function(api, attr){
        var data = {};
        data[attr] = api[attr];
        $http.put(api_link+api.name+'/'+api._id, data).success(function(edited_data_msg){
            console.log(edited_data_msg);
        }).error(function (data, status, headers, config) {});
    }

    $scope.rewrite_api_visible = function(api, boolean){
        var data = {};
        data['public'] = boolean;
        $http.put(api_link+api.name+'/'+api._id, data).success(function(edited_data_msg){
            console.log(edited_data_msg);
        }).error(function (data, status, headers, config) {});
    }

    $scope.del_api = function (api) {
        //刪除後端資料
        var app = $scope.appname;   //傳入所屬app名稱
        var name = api.name;        //傳入api名稱
        var id = api._id;        //傳入api id
        console.log(api);

        $http({
            method: 'DELETE',
            url: './manage/api/' + app + '/' + id,
        }).success(function (data, status, headers, config) {
            if (data.result == 1) {
                $scope.apiList.splice($scope.apiList.indexOf(api), 1);
            } else {
                alert('error');
            };
        }).error(function (data, status, headers, config) {

        });

    };

    $scope.api_table_head = [
		{ 'name': 'API Name' },
        {'name': 'Owner'},
        { 'name': 'Category' },
        { 'name': 'Visible' },
		{ 'name': '' }//delete btn
    ]

    $scope.api_cate = [
		{ 'name': 'Sport', 'required': true },
		{ 'name': 'Social Network', 'required': true },
		{ 'name': 'Weather', 'required': true },
		{ 'name': 'Goverment', 'required': true },
    ]


    $scope.apiList = [];

    $scope.apiSearch = [];

    $scope.cleanSearch = function () {
        $scope.apiSearch = [];
    }

    $scope.rest_methods = [
		{ 'name': 'GET', 'checked': false, 'sql': '', 'required': true },
		{ 'name': 'POST', 'checked': false, 'sql': '', 'required': true },
		{ 'name': 'PUT', 'checked': false, 'sql': '', 'required': true },
		{ 'name': 'DELETE', 'checked': false, 'sql': '', 'required': true },
    ]

    $scope.click_checkbox = function (ch_option) {
        // 確認是否有勾選REST方法
        var is_click = false;
        for (var c in ch_option) {
            //有勾選
            if (ch_option[c].checked == true) {
                is_click = true;
            }
        }
        //沒勾選
        if (is_click == false) {
            //加入勾選提示
            for (var c in ch_option) {
                ch_option[c].required = true;;
            }
        }
            //有勾選
        else {
            //取消勾選提示, 有勾選其中一個選項即可
            for (var c in ch_option) {
                ch_option[c].required = false;
            }
        }
    }

    $scope.visible_clicked = true;
    $scope.api_public = function (name) {
        $scope.visible_clicked = name;
    }

    $scope.new_tag = "";

    $scope.typing_tag = false;
    $scope.api_submit = function () {
        // 送出表單
        if ($scope.typing_tag == false) {
            var app = $scope.appname;   //傳入所屬app名稱
            var api = this.new_api_name;    //傳入所建立之api名稱
            var method = [];
            var config = { sql: {}, source: {} };
            var tag = [];
            var types = $scope.types;
            var sources = [];
            var tag_array = [];

            for (var c in $scope.rest_methods) {
                if ($scope.rest_methods[c].checked == true) {
                    var cname = $scope.rest_methods[c].name;
                    var csql = $scope.rest_methods[c].sql;
                    method.push(cname); //填入類型
                    config.sql[cname] = csql || $scope.sql;   //填入SQL語法
                };
            };

            tag_array = $scope.new_tag.split(" ")
            // owner_array = $scope.api_owner.split(" ");

            sources.push($scope.source);
            // tag.push($scope.new_tag);
            config.source = sources;

            var datas = { 'name': api, 'public': $scope.visible_clicked, 'type': types, 'tag': tag_array, 'method': method, 'config': config, 'description': $scope.api_desc };   //資料格式

            $http({
                method: 'POST',
                url: './manage/api/' + app + '/' + api,
                data: datas
            }).success(function (data, status, headers, config) {
                if (data.result == 1) {
                    datas['owner'] = data.data.owner;
                    datas['_id'] = data.data._id;
                    $scope.apiList.splice(0, 0, datas);
                    $scope.create_api = false;
                    $scope.api_outer = false;
                    $scope.api_desc = "";
                    $scope.api_list = true;
                } else {
                    alert('Please change your api name');
                };
            }).error(function (data, status, headers, config) {

            });

        };
    };

    // 	$scope.formA = {};
    // $scope.tags = [{"name":"a"},{"name":"b"}];	
    // $scope.addTag = function(tag) {
    // 	$scope.tags.push({"name":tag});
    // 	$scope.new_tag = '';
    // };//--
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


    var reqs = [800, 324, 255, 466, 523, 43, 43, 23, 123, 43, 24, 359, 345, 45, 543, 43, 234, 755, 234, 74, 77, 231, 324, 34, 653, 853, 63, 61, 86, 245]
    $scope.daily_req(reqs);
    // ====================== api bottom======================	
    // ====================== outer api ======================
    var parseKeys = function (data) {
        var keys = [];
        if (data.length > 1) {
            for (var key in data[0]) {
                keys.push(key);
            }
        }
        else {
            for (var key in data) {
                keys.push(key);
            }
        }
        console.log(keys);
        return keys;
    };

    $scope.collections = [];
    $scope.keys = parseKeys($scope.collections);
    $scope.cost = { "fetch": 0, "index": 0 };

    $scope.source = "http://opendata.epa.gov.tw/ws/Data/AQX/?$orderby=PSI&$skip=0&$top=1000&format=json";
    $scope.sql = 'select * from table where PM10 > 150';

    $scope.updatePath = function () {
        $scope.url = "/api?source=" + encodeURIComponent($scope.source) + "&sql=" + encodeURIComponent($scope.sql);
        $scope.outer = "http://simple.tanpopo.cc" + $scope.url;
    };
    $scope.fetch = function (path, sql) {
        $scope.loading = true;
        $scope.updatePath();
        $http.get($scope.url).success(function (data, status, headers, config) {
            $scope.parseData(data);
            $scope.loading = false;
        }).error(function (data, status, headers, config) {
            console.log(data);
            console.log(status);
            console.log(headers);
            $scope.loading = false;
        });;
    };
    $scope.parseData = function (result) {
        $scope.keys = parseKeys(result.data);
        $scope.cost = result.cost;
        $scope.collections = result.data;

    };

    $scope.updatePath();
    $scope.fetch();

});

// ================= show api info========================
