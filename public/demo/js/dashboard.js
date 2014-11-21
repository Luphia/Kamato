$.getJSON("http://simple.tanpopo.cc/ui/dashboard/20984/json").done(
	function( jsonData ) {
		var rs = jsonData.data;		//取出key為data的所有東西
		
		// 設定身高及單位
		setHeight(rs.profile.height.value, rs.profile.height.unit);
		// 設定體重及單位
		setWeight(rs.profile.weight.value, rs.profile.weight.unit);
		// 設定體脂及單位
		setBodyfat(rs.profile.bodyfat.value, rs.profile.bodyfat.unit);
		// 設定年齡
		setAge(rs.profile.birth);
		// 設定運動量
		setExercise(rs.activities.exercise.current, rs.activities.exercise.standard);
		// 設定睡眠量
		setSleep(rs.activities.sleep.current, rs.activities.sleep.standard);
		// 設定營養攝取量
		setCalories(rs.activities.calories.current, rs.activities.calories.standard);
		// 設定30日體重圖
		displayWeightChart(rs.physiological.weight);
		// 設定心跳圖
		displayHeartbeatChart(rs.physiological.heartbeat);
	}
);

//=======================================================
//------------------
// 設定畫面各值
//------------------
/**
 * 設定『本日健康分析』畫面中，個人資訊『身高』的資料。
 * param value : 身高
 * param unit : 單位
 */
function setHeight(value, unit) {
	setLeftArea("#heightValue", "heightUnitValue", value, unit);
}

/**
 * 設定『本日健康分析』畫面中，個人資訊『體重』的資料。
 * param value : 體重
 * param unit : 單位
 */
function setWeight(value, unit) {
	setLeftArea("#weightValue", "weightUnitValue", value, unit);
}

/**
 * 設定『本日健康分析』畫面中，個人資訊『體脂』的資料。
 * param value : 體脂
 * param unit : 單位
 */
function setBodyfat(value, unit) {
	setLeftArea("#bodyfatValue", "bodyfatUnitValue", value, unit);
}

/**
 * 設定『本日健康分析』畫面中，個人資訊『年齡』的資料。
 * param value : 出生年月日
 */
function setAge(value) {
	var rs = formatFloat(((new Date() - new Date(value))/(1000*60*60*24*365)), 0);
	$("#ageValue").text(rs);
	$("#ageValue").attr("data-value", rs);
}


/**
 * 設定『本日健康分析』畫面中，個人資訊『XXX』的資料。
 * param valueIdName : 值顯示區塊的id
 * param unitIdName : 單位顯示區塊的id
 * param value : 值
 * param unit : 單位
 */
function setLeftArea(valueIdName, unitIdName, value, unit) {
	$(valueIdName).text(value);
	$(valueIdName).attr("data-value", value);
	$(unitIdName).text(unit);
}

/**
 * 設定『活動分析』畫面中，『XXX量』的資料。
 * param valueName : (String) 進度條的id
 * param statusName : (String) 進度條下方顯示狀態過高或過低的<div>的id
 * param current : (int) 當前XXX量
 * param standard : (int) 標準值
 */
function setProgress(valueName, statusName, current, standard) {
	// 轉換成百分比
	var rs = formatFloat((current/standard), 2);

	// 以百分比顯示
	var strRsPercentage = (rs*100);

	console.log("百分比 : "+strRsPercentage);
	// [狀態顯示] x<50%則過低，x>150%則過高。
	if(strRsPercentage<50) {
		console.log("過低");
		$(valueName).attr("class", "tooltips progress-bar progress-bar-danger");
		$(statusName).html("<span class='sign low'><i class='fa fa-exclamation-triangle'></i><span>過低</span></span>");
	} else if(strRsPercentage>150) {
		console.log("過高");
		$(valueName).attr("class", "tooltips progress-bar progress-bar-danger");
		$(statusName).html("<span class='sign high'><i class='fa fa-exclamation-triangle'></i><span>過高</span></span>");
	} else if(strRsPercentage<150 && strRsPercentage>50) {
		console.log("正常");
		$(valueName).attr("class", "tooltips progress-bar progress-bar-info");
		$(statusName).html("<span class='sign normal'><i class='fa fa-exclamation-triangle'></i><span></span></span>");
	}
	
	$(valueName).text(current);
	$(valueName).attr("data-original-title", current);
	$(valueName).attr("style", "width: "+strRsPercentage/2+"%");
}

/**
 * 設定『活動分析』畫面中，『運動量』的資料。
 * param current : (int) 當前運動量
 * param standard : (int) 標準值
 */
function setExercise(current, standard) {
	setProgress("#exerciseValue", "#exerciseStatus", current, standard);
}

/**
 * 設定『活動分析』畫面中，『睡眠量』的資料。
 * param current : (int) 當前睡眠量
 * param standard : (int) 標準值
 */
function setSleep(current, standard) {
	setProgress("#sleepValue", "#sleepStatus", current, standard);
}

/**
 * 設定『活動分析』畫面中，『營養攝取量』的資料。
 * param current : (int) 當前營養攝取量
 * param standard : (int) 標準值
 */
function setCalories(current, standard) {
	setProgress("#caloriesValue", "#caloriesStatus", current, standard);
}

/**
 * 顯示30日體重圖
 * param value : json資料
 */
function displayWeightChart(value) {
	console.log("30日體重圖start");
	barChart(value);
	console.log("30日體重圖end");
}

/**
 * 顯示心跳圖
 */
function displayHeartbeatChart(value) {
console.log("心跳圖start");
	dynamicChart(value);
console.log("心跳圖end");
}

//=======================================================
//------------------
// 公用函式
//------------------
/**
 * 如1109.1893要取小數後第二位。
 * 結果就是1109.19。
 * param num : 第一個參數num是帶有小數的變數，
 * param pos : 第二個參數pos是要取小數後的幾位數。
 * return 取小數後的數字
 */
function formatFloat(num, pos)
{
  var size = Math.pow(10, pos);
  return Math.round(num * size) / size;
}

//=======================================================
//Bar Chart
function barChart(value) {

    if ($("#bar-chart")[0]) {
		var arrayValue = new Array();
		for(var i=0; i<30; i++) {
			for(j in value) {
				arrayValue[i] = [(i+1), value[i]];
			}
		}

		var dataTmp = [];
		for(var i in arrayValue) {
			dataTmp.push(arrayValue[i]);
		}

		//console.log("data1:\n"+dataTmp);
        //var dataX = [[1,60], [2,-30], [3,-10], [4,-100], [5,-30], [6,90], [7,85], [8,40], [9,5], [10,30], 
		//			 [11,50], [12,30], [13,10], [14,100], [15,-10], [16,-23], [17,85], [18,-40], [19,-5], [20,30],
		//			 [21,73], [22,30], [23,-14], [24,-27], [25,-10], [26,90], [27,85], [28,-40], [29,-5], [30,30]];

        var barData = new Array();

        barData.push({
                data : dataTmp,
                label: 'Product 1',
                bars : {
                        show : true,
                        barWidth : 0.1,
                        order : 1,
                        fill:1,
                        lineWidth: 0,
                        fillColor: 'rgba(255,255,255,0.6)'
                }
        });

        //Display graph
        $.plot($("#bar-chart"), barData, {
                
                grid : {
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.25)',
                        show : true,
                        hoverable : true,
                        clickable : true,       
                },
                
                yaxis: {
                    tickColor: 'rgba(255,255,255,0.15)',
                    tickDecimals: 0,
                    font :{
                        lineHeight: 13,
                        style: "normal",
                        color: "rgba(255,255,255,0.8)",
                    },
                    shadowSize: 0,
                },
                
                xaxis: {
                    tickColor: 'rgba(255,255,255,0)',
                    tickDecimals: 0,
                    font :{
                        lineHeight: 13,
                        style: "normal",
                        color: "rgba(255,255,255,0.8)",
                    },
                    shadowSize: 0,
                },
                
                legend : true,
                tooltip : true,
                tooltipOpts : {
                        content : "<b>%x</b> = <span>%y</span>",
                        defaultTheme : false
                }

        });
        
        $("#bar-chart").bind("plothover", function (event, pos, item) {
            if (item) {
                var x = item.datapoint[0].toFixed(2),
                    y = item.datapoint[1].toFixed(2);
                $("#barchart-tooltip").html(item.series.label + " of " + x + " = " + y).css({top: item.pageY+5, left: item.pageX+5}).fadeIn(200);
            }
            else {
                $("#barchart-tooltip").hide();
            }
        });

        $("<div id='barchart-tooltip' class='chart-tooltip'></div>").appendTo("body");
    }
}

//Dynamic Chart
function dynamicChart(value) {
    if ($('#dynamic-chart')[0]) {
        var data = [],
            totalPoints = 300;

		var aryHeartbeat = [];
		for(var i in value) {
			aryHeartbeat.push([parseInt(i), value[i]]);
		}

		var start = 0;
		var getCurrentData = function() {
			var pick = 100,
				rs = [];

			var i, j;
			for(i = 0; i < pick && (start+i) < value.length; i++) {
				rs.push([i, value[start + i]]);
			}
			for(j = 0; rs.length < pick; i++) {
				rs.push([i, value[j++]]);
			}
			
			start = (++start) % value.length;
			return rs;
		};
		
		//原始資料
        //function getRandomData() {
        //    if (data.length > 0)
        //        data = data.slice(1);
		//
        //    while (data.length < totalPoints) {
        //        var prev = data.length > 0 ? data[data.length - 1] : 50,
        //            y = prev + Math.random() * 10 - 5;
        //        if (y < 0) {
        //            y = 0;
        //        } else if (y > 90) {
        //            y = 90;
        //        }
		//
        //        data.push(y);
        //    }
		//
        //    var res = [];
        //    for (var i = 0; i < data.length; ++i) {
        //        res.push([i, data[i]])
        //    }
        //    return res;
        //}

		//console.log("--------[檢查value格式]--------");
		//console.log("aryHeartbeat值:\n"+JSON.stringify(aryHeartbeat));
		//console.log("getRandomData()值:\n"+JSON.stringify(getRandomData()));

        var updateInterval = 90;
        var plot = $.plot("#dynamic-chart", [ aryHeartbeat ], {
            series: {
                label: "Data",
                lines: {
                    show: true,
                    lineWidth: 1,
                    fill: 0.25,
                },

                color: 'rgba(255,255,255,0.2)',
                shadowSize: 0,
            },
            yaxis: {
                min: 0,
                max: 160,
                tickColor: 'rgba(255,255,255,0.15)',
                font :{
                    lineHeight: 13,
                    style: "normal",
                    color: "rgba(255,255,255,0.8)",
                },
                shadowSize: 0,

            },
            xaxis: {
                tickColor: 'rgba(255,255,255,0.15)',
                show: true,
                font :{
                    lineHeight: 13,
                    style: "normal",
                    color: "rgba(255,255,255,0.8)",
                },
                shadowSize: 0,
                min: 0,
                max: 60
            },
            grid: {
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
                labelMargin:10,
                hoverable: true,
                clickable: true,
                mouseActiveRadius:6,
            },
            legend: {
                show: false
            }
        });

        function update() {
			var data = getCurrentData();
            plot.setData([data]);
            // Since the axes don't change, we don't need to call plot.setupGrid()

            plot.draw();
            setTimeout(update, updateInterval);
        }

        update();

        $("#dynamic-chart").bind("plothover", function (event, pos, item) {
            if (item) {
                var x = item.datapoint[0].toFixed(2),
                    y = item.datapoint[1].toFixed(2);
                $("#dynamic-chart-tooltip").html(item.series.label + " of " + x + " = " + y).css({top: item.pageY+5, left: item.pageX+5}).fadeIn(200);
            }
            else {
                $("#dynamic-chart-tooltip").hide();
            }
        });

        $("<div id='dynamic-chart-tooltip' class='chart-tooltip'></div>").appendTo("body");
    }
}