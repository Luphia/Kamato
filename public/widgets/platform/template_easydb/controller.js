Kamato.register.controller('easyDBCtrl', function ($scope, $http, $modal, ngDialog, $rootScope){
// ====================== easydb top======================

	var db_link = "./manage/db/";

	$http.get(db_link).
        success(function(db) {
            $scope.tables = db.data;
            $scope.table_click(db.data[0]);
        });


    $scope.t_d_more = [];
    var jsonTemp = {};
    var viewing_table = "";

    $scope.findData = function() {
    	var link = db_link + $scope.default_view_table;
    	var searchQuery;
    	try {
    		searchQuery = {"query": JSON.parse($scope.command_sample)};
    	}
    	catch(e) {
    		searchQuery = {"query": {}};
    	}
    	$http.post(link, searchQuery).success(function(schema) {
        	var t_d_temp = schema.data.list;
        	$scope.t_head = schema.data.list[0];
 			$scope.colspan = Object.keys(schema.data.list[0]).length +1; //+1是del button欄位
        	angular.forEach(t_d_temp, function(list_value, list_key){
        		angular.forEach(t_d_temp[list_key], function(value, key){
        			var value_id = t_d_temp[list_key]._id;
        			if(typeof(value) == "object" && value != null){
        				//存json			
        				jsonTemp[value_id+key] = value;
        				$scope.t_d_more.push(jsonTemp);
        				//json換註解
        				t_d_temp[list_key][key] = "json file"
        			}
        			$scope.t_d = t_d_temp;

        		})
        	});
    	});
    }

	$scope.table_click =function(name){
		viewing_table = name
		$scope.is_show = false;
		//要把顯示json內容方框丟回table最下面,否則會被ng-repeat蓋過 
		var j_text = document.getElementsByClassName("json_text");
		var table = document.getElementsByClassName("db_table");
		table[0].childNodes[1].appendChild(j_text[0]);

		$scope.default_view_table = name;
		$http.get(db_link+name+"/").
        success(function(schema) {
        	var t_d_temp = schema.data.list;
        	$scope.t_head = schema.data.list[0];
 			$scope.colspan = Object.keys(schema.data.list[0]).length +1; //+1是del button欄位
        	angular.forEach(t_d_temp, function(list_value, list_key){
        		angular.forEach(t_d_temp[list_key], function(value, key){
        			var value_id = t_d_temp[list_key]._id;
        			if(typeof(value) == "object" && value != null){
        				//存json			
        				jsonTemp[value_id+key] = value;
        				$scope.t_d_more.push(jsonTemp);
        				//json換註解
        				t_d_temp[list_key][key] = "json file"
        			}
        			$scope.t_d = t_d_temp;

        		})
        	})
        });
	}

    $scope.del_warn = function(){
    	$scope.warn_hint = true;
    	$scope.warning_text =viewing_table;
    }

    $scope.del_table = function(){
    	var next_table_index = $scope.tables.indexOf(viewing_table)+1;
    	var next_table = $scope.tables[next_table_index];
    	$scope.tables.splice($scope.tables.indexOf(viewing_table),1);  //從table list移除
    	$scope.table_click(next_table);   //畫面換到下一個table的內容
    	$scope.warn_hint = false;
    }

    $scope.close_warn_hint = function(){
    	$scope.warn_hint = false;
    }

	$scope.del_t_row = function(row){
		$scope.t_d.splice($scope.t_d.indexOf(row),1);
	}

	var pre_id="";
	$scope.is_show = false;
	var pre_id_attr="";


	$scope.show_json_file = function(id, attr_name){ 
		var id_attr_name = id+attr_name;
		if(pre_id_attr == id_attr_name){
			$scope.is_show = !$scope.is_show;
		}
		else{
			pre_id_attr = id_attr_name;
			$scope.is_show = true;
			var elem = document.getElementById(id);
			var j_text = document.getElementsByClassName("json_text");
			var table = document.getElementsByClassName("db_table");				
			$scope.show_json= jsonTemp[id_attr_name];
			$scope.t_json = id_attr_name;
			table[0].childNodes[1].insertBefore(j_text[0], elem.nextSibling);	
		}
	}


	$scope.keyword = [
		{'name': 'SELECT * FROM '},
		{'name': 'SELECT FROM  WHERE '},
		{'name': 'INSERT INTO '},
		{'name': 'UPDATE SET  WHER '},
		{'name': 'DELETE FROM  WHERE '},
	]

	$scope.show_sample = false;
	$scope.sample_list = function(){		
			$scope.show_sample = true;		
	}

	$scope.sql_keyword_clicked = function(name){
		$scope.command_sample = name;
		$scope.show_sample = false;
	}

	$scope.cant_close = false;
	$scope.close_sample_list = function(){
		if($scope.cant_close == false){
			$scope.show_sample = false;
		}
	}
// ====================== easydb bottom======================
});
