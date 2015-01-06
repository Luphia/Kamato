Kamato.register.controller('easyDBCtrl', function ($scope, $http, $modal, ngDialog, $rootScope){

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

     $scope.custom_rows
    $scope.option_index = 2;          //page   
    $scope.default_rows = 15;
    $scope.rows_options = [
        {'num': 5},
        {'num': 10},
        {'num': 15},
        {'num': 20}
    ]

    $scope.custom_rows = 15;  //table click
    $scope.new_row_uncommitted = false;
    $scope.new_row_count = 0;  //計算新資料的筆數

    $scope.create_td_click = function() {
        $scope.new_row_count += 1;
        var new_td = {};
        for( var h in $scope.t_head){
            new_td[h] = ''
        }

        $scope.t_d.splice(0,0,new_td);
        $scope.new_row_uncommitted = true;
    }

    $scope.commit_new_row = function(){

        var new_row_array = []; 
        for (var i = 0; i < $scope.new_row_count; i++){
            var is_edit = false;
            for(var t in $scope.t_d[i]){
                console.log($scope.t_d)
                if( (t != '$$hashKey') && ($scope.t_d[i][t] != '')){
                    is_edit = true;
                }
            }
            if(is_edit == true){
                
                // $scope.t_d.splice($scope.t_d.indexOf(temp_t_d[i]),1);
                 new_row_array.push($scope.t_d[i]);
            }
        }

        var new_row_array_reverse = new_row_array.reverse();

        $http.post(db_link+viewing_table+'/', new_row_array).success(function(create_row){
            $scope.table_click(viewing_table, $scope.custom_rows, 1);
        })       
        $scope.new_row_uncommitted = false;
        $scope.new_row_count = 0 ;
    }

	$scope.table_click =function(name, default_table_rows, page_num){
        pre_id_attr="";    //清除上一次在其他table點擊json的事件
        $scope.warn_hint = false;   //清除在其他table點擊的刪除警告標語
        $scope.sch_name = '';
        $scope.custom_rows = default_table_rows;
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

    $scope.sch_click = function(name){  
        if($scope.sch_name  == name){
            $scope.sch_name = '';
        }
        else{
            $scope.sch_name = name;
        }
    }

    $scope.sch_menu_click = function(schema_name){
        if($scope.selected_sch_menu == schema_name){
            $scope.selected_sch_menu = '';
        }
        else{ 
            $scope.selected_sch_menu = schema_name;
        }
    }

    $scope.sch_type_click = function(schema_name, type){
        if(schema_name == '_id'){
            $scope.t_head[schema_name] = 'Number';
        }
        else{
            $scope.t_head[schema_name] = type;    
        }
        $scope.sch_name = '';
        console.log($scope.t_head); 
        $http.put(db_link+viewing_table, $scope.t_head).
        success(function(page_schema){  
            console.log(page_schema);
        });
    }

    $scope.edit_td = function(key, id, td){
        $scope.id_td = id+td;  
    }

    // ++ 需要避開delete btn
    var edit_temp_array =[];
    $scope.edit_finish = function(id, edited_key, row){ 
        var temp_json = {};
        temp_json[edited_key] = row[edited_key];
        edit_temp_array.push(temp_json);
        if( id != ''){
            //不是新增的data
            $http.put(db_link+viewing_table+'/'+id, edit_temp_array[0]).success(function(edited_data_msg){
                console.log(edited_data_msg);
            })
        }
        var e = event.target;
        var next_e = e.parentNode.nextElementSibling.firstElementChild;
        e.blur();
        next_e.focus();
    }

    $scope.show_table = function(table_name, custom_table_rows, page_num){
        //要把顯示json內容方框丟回table最下面,否則會被ng-repeat蓋過 
        j_text = document.getElementsByClassName("json_text");
        table = document.getElementsByClassName("db_table");
        table[0].childNodes[1].appendChild(j_text[0]);

        $scope.page = page_num;
        //第N頁,第一筆資料的index
        var new_page_first_index = custom_table_rows*(page_num-1);
        var total_data = custom_table_rows;

        $http.get(db_link+table_name).
        success(function(page_schema){
            page_schema.data.columns['_id'] = 'Number';
            $scope.t_head = page_schema.data.columns;
        });

        $http.get(db_link+table_name+"/?q=limit "+new_page_first_index+','+custom_table_rows).
        success(function(page_schema){
            var t_d_temp = page_schema.data.list;

            if( Object.keys(page_schema.data.list[0] || []).length == 0){
                //空物件
                $scope.t_d = [];
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

        $http.delete(db_link+delete_table_name).success(function(del_msg){
            console.log(del_msg);
        })

    	$scope.tables.splice($scope.tables.indexOf(delete_table_name),1);  //從table list移除
        if (delete_table_name == viewing_table){
        	$scope.table_click(next_table, 15, 1);   //畫面換到下一個table的內容    
        }
    	$scope.warn_hint = false;
    }

    $scope.close_warn_hint = function(){
    	$scope.warn_hint = false;
    }

	$scope.del_t_row = function(row, id){
		$scope.t_d.splice($scope.t_d.indexOf(row),1);
        $scope.new_row_count = 0;
        for( var t in $scope.t_d){
            if ($scope.t_d[t]['_id'] == ''){
                $scope.new_row_count += 1;
            }
        }
        console.log($scope.new_row_count);
        if( id != ''){
            //非新增資料狀態
            $http.delete(db_link+viewing_table+'/'+id).success(function(del_row){
                console.log(del_row);
            })
        }

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

    //=========================Create table====================
    $scope.change_page = false;
    $scope.strick_clicked  = false;
    $scope.columns = true;

    $scope.create_table = function(){
        $scope.change_page = true;

    }

    $scope.back_btn = function(){
        $scope.change_page = false;
    } 

    $scope.schema_type = [  
        {'type': 'String'},
        {'type': 'Number'},
        {'type': 'Boolean'},
        {'type': 'Date'},
        {'type': 'JSON'},
        {'type': 'Binary'}
    ]

    $scope.submit_col_sche = {"name":"", "columns":{}};
    $scope.input_col_sche = [
        {'col_name':'', 'schema_type': ''}
    ]

    $scope.add_col_fn = function(){
        $scope.input_col_sche.push({'col_name':'', 'schema_type': ''});
        $scope.col_stricked();
    }

    $scope.submit = function(){
        $scope.submit_col_sche["name"] = $scope.table_name;
        var temp = {};
        for (var i in $scope.input_col_sche){
            temp[$scope.input_col_sche[i].col_name] = $scope.input_col_sche[i].schema_type;
        }
        $scope.submit_col_sche["columns"] = temp;
        //頁面更換     
        $scope.change_page = false;
        $http.post(db_link+$scope.table_name, $scope.submit_col_sche)
        .success(function(post_table_msg){
            console.log(post_table_msg);
             $http.get(db_link).
            success(function(db) {
                console.log(db)
                $scope.tables = db.data;
                $scope.table_click(db.data[0], 15, 1);
            });           
        })
        $scope.reset_create_table_form();
    }

    $scope.reset_create_table_form = function(){
        $scope.table_name = "";
        $scope.input_col_sche = [
            {'col_name':'', 'schema_type': ''}
        ]
        $scope.strick_clicked = false;
    } 

    $scope.del_col_sche = function(key){
        $scope.input_col_sche.splice(key,1);
        $scope.col_stricked();
    }

    $scope.col_stricked = function(){
        console.log($scope.strick_clicked);
        if( $scope.strick_clicked == true){
            
            if(($scope.input_col_sche).length <= 1){
                $scope.columns = false;
            }
            else{
                $scope.columns = true;
            }
        }
        else{
            $scope.columns = true;
        }
    }
});

Kamato.register.directive('dbdata', function ($compile) {
    return {
        restrict: 'E',
        // replace: true,
        link: function(scope, element, attrs){
            scope.scheTypeUrl = function(){
                return 'widgets/platform/platform_easydb/template-'+attrs.schetype+'-data.html';
            }
        },
        template: '<div ng-include="scheTypeUrl()"></div>'
            // console.log(aaa,bbb,ccc,ddd);
    }
});