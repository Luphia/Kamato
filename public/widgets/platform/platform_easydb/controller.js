Kamato.register.controller('easyDBCtrl', function ($scope, $http, $modal, ngDialog, $rootScope){
// ====================== easydb top======================

	var db_link = "./manage/db/";

	$http.get(db_link).
        success(function(db) {
            $scope.tables = db.data;
            $scope.table_click(db.data[0], 15, 1);
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

    var first_row_id = 0; 
    // $scope.default_table_rows = 15;

	$scope.table_click =function(name, default_table_rows, page_num){
        //清除上一次在其他table點擊json的事件
        pre_id_attr="";
        //清除在其他table點擊的刪除警告標語
        $scope.warn_hint = false;
		viewing_table = name;
		$scope.is_show = false;
		//要把顯示json內容方框丟回table最下面,否則會被ng-repeat蓋過 
		var j_text = document.getElementsByClassName("json_text");
		var table = document.getElementsByClassName("db_table");
		table[0].childNodes[1].appendChild(j_text[0]);
		$scope.default_view_table = name;

        //Get table資訊(第一筆資料id, 總筆數)
		$http.get(db_link+name).
        success(function(schema) {
            first_row_id = schema.data.max_serial_num;
            var table_length = schema.data.table_length;
            if( (table_length%default_table_rows) <= 0){
                $scope.total_pages = new Array(table_length/default_table_rows);
            }
            else{ 
                $scope.total_pages = new Array(parseInt(table_length/default_table_rows)+1);
            }
            //顯示table內容(預設15筆資料)
            $scope.show_table(name,default_table_rows, page_num);

        });
	}


    $scope.show_table = function(table_name, custom_table_rows, page_num){
        //要把顯示json內容方框丟回table最下面,否則會被ng-repeat蓋過 
        j_text = document.getElementsByClassName("json_text");
        table = document.getElementsByClassName("db_table");
        console.log(table);
        table[0].childNodes[1].appendChild(j_text[0]);

        var total_data = custom_table_rows;
        var new_page_first_id = first_row_id;
        //無法直接得到第N頁的第一筆資料ID, 故先找出前N-1頁的資料總數
        if(page_num != 1){
            total_data = (page_num-1)*custom_table_rows;
            //找出第N-1頁,最後一筆資料ID & 第N頁,第一筆資料ID
        }

        $http.get(db_link+table_name+"/?q=limit "+first_row_id+','+total_data).
        success(function(page_schema){
            if(page_num != 1){ 
            //不是第一頁
                new_page_first_id = page_schema.data.end +1 ;      
            }
            $http.get(db_link+table_name+"/?q=limit "+new_page_first_id+','+custom_table_rows).
            success(function(page_schema){
                var t_d_temp = page_schema.data.list;
                $scope.t_head = page_schema.data.list[0];
                if( Object.keys(page_schema.data.list[0] || {}).length == 0){
                    //空物件
                    $scope.t_d = {};
                }
                else{
                    $scope.colspan = Object.keys(page_schema.data.list[0]).length +1; //+1是del button欄位
                    angular.forEach(t_d_temp, function(list_value, list_key){
                        angular.forEach(t_d_temp[list_key], function(value, key){
                            var value_id = t_d_temp[list_key]._id;
                            //顯示json檔案格式
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
                }
            });     
        });      
    }

    var delete_table_name="";
    $scope.del_warn = function(table_name){
        delete_table_name = table_name;
    	$scope.warn_hint = true;
    	$scope.warning_text = table_name;
    }

    $scope.del_table = function(){
    	var next_table_index = $scope.tables.indexOf(delete_table_name)+1;
    	var next_table = $scope.tables[next_table_index];
    	$scope.tables.splice($scope.tables.indexOf(delete_table_name),1);  //從table list移除
        if (delete_table_name == viewing_table){
        	$scope.table_click(next_table, 15, 1);   //畫面換到下一個table的內容    
        }
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
    


	$scope.show_json_file = function(id, attr_name, table_name){ 
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
