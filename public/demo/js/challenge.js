$.getJSON("http://simple.tanpopo.cc/ui/challenge/20984/json").done(
	function( jsonData ) {
		console.log("測試用...");
		//console.log(jsonData);
		//for(var i in jsonData) {
		//	console.log("key: "+ i + "\t value: "+ jsonData[i]);
		//}
		
		var rs = jsonData.data;		//取出key為data的所有東西
		
		// 設定綜合排名 - 運動時間
		setRecordTime(rs.record);
		
		// 挑戰賽 - 距離競賽
		setChallenge(rs.challenge);
	}
);

//=======================================================
//------------------
// 設定畫面各值
//------------------
/**
 * 設定『本日紀錄』畫面中，綜合排名的資料。
 * param rs : (JSON Object) 綜合排名的資料
 */
function setRecordTime(rs) {
	$("#recordRank .rank").text(rs.rank);

	// 運動時間
	$("#recordRankTime > h3").text(rs.time.value+" "+rs.time.unit);
	$("#recordRankTime_rank").text(rs.time.rank);
	
	// 消耗熱量
	$("#recordRankCalories > h3").text(rs.calories.value+" "+rs.calories.unit);
	$("#recordRankCalories_rank").text(rs.calories.rank);
	
	// 完成距離
	$("#recordRankDistance > h3").text(rs.distance.value+" "+rs.distance.unit);
	$("#recordRankDistance_rank").text(rs.distance.rank);
}

/**
 * 設定『本日紀錄』畫面中，挑戰賽的資料。
 * param rs : (JSON Object) 挑戰賽的資料
 */
function setChallenge(rsObj) {
	var aryRsObj = rsObj;

	for(var i in aryRsObj) {

		if( aryRsObj[i]["type"] == "distance" ) {
			console.log("距離競賽");
			// 設定旗幟的標頭文字
			aryRsObj[i]["flagTitleName"] = "距離競賽";

			// 判斷是否結束
			if( aryRsObj[i]["end"]==false ) {
				// 時間計算
				var updateInterval = 1000;
				var startDate = new Date(),
					endDateX = new Date(aryRsObj[i]["during"][1]),
					spantime = (endDate - startDate)/1000;

				var hour = "", mins = "", second = "";
				var x = i;
				var lastTime = function() {
					
					var t = endDateX - new Date();
					var nhr = t % 3600000,
						hr = (t- nhr) / 3600000,
						nmin = (t) % 60000,
						min = (t- hr*3600000 - nmin) / 60000,
						sec = nmin / 1000;
					// 將數字補成兩位數
					if(min<10) {
						min = "0" + min;
					}
					if(sec<10) {
						sec = "0" + sec;
					}
					aryRsObj[x]["hour"] = hr;
					aryRsObj[x]["min"] = min;
					aryRsObj[x]["sec"] = sec;

					$($(".countDown > span:nth-child(1)")[x]).text(hr);
					$($(".countDown > span:nth-child(2)")[x]).text(min);
					$($(".countDown > span:nth-child(3)")[x]).text(sec);

				}
				lastTime();
				console.log("#######");
				setInterval(lastTime, 50);

				// 目前排名
				var strRank = aryRsObj[i]["rank"],
					strParticipants = aryRsObj[i]["Participants"],
					strRsPercentage02 = formatFloat(((strParticipants-strRank) / strParticipants),1)*100;

				aryRsObj[i]["strRsPercentage02"] = strRsPercentage02;

			} else {
				// 競賽已結束
				if( aryRsObj[i]["end"]==true && aryRsObj[i]["finish"]==false ) {
					aryRsObj[i]["finishDate"] = "未達成";
					aryRsObj[i]["failclass"] = "fail";
				}
			}
			var tag = $("#tmplItemDistance").tmpl(aryRsObj[i]).appendTo("#tmplDistance");

		} else if( aryRsObj[i]["type"] == "calories" ) {
			// 能量競賽
			var startDate = new Date(aryRsObj[i]["during"][0]), 
				endDate = new Date(aryRsObj[i]["during"][1]), 
				showStartMonth = (startDate.getMonth()+1)<10? "0"+(startDate.getMonth()+1) : (startDate.getMonth()+1),
				showStartDay = startDate.getDate()<10 ? "0"+startDate.getDate() : startDate.getDate(),
				startDateFormat = startDate.getFullYear() + "-" + showStartMonth + "-" + showStartDay,
				showEndMonth = (endDate.getMonth()+1)<10? "0"+(endDate.getMonth()+1) : (endDate.getMonth()+1),
				showEndDay = endDate.getDate()<10 ? "0"+endDate.getDate() : endDate.getDate(),
				endDateFormat = endDate.getFullYear() + "-" + showEndMonth + "-" + showEndDay;
				
			// 設定旗幟的標頭文字
			aryRsObj[i]["flagTitleName"] = "能量競賽";
			aryRsObj[i]["raceRange"] = startDateFormat+" ~ "+endDateFormat;
			
			if( aryRsObj[i]["end"]==true && aryRsObj[i]["finish"]!=false ) {
				console.log("顯示達成的時間");
				var finishTime = new Date(aryRsObj[i]["finish"]),
					showMonth = parseInt(finishTime.getMonth()+1)<10 ? "0"+(finishTime.getMonth()+1) : (finishTime.getMonth()+1),
					showDay = finishTime.getDate()<10 ? "0"+finishTime.getDate() : finishTime.getDate(),
					setDateFormat = finishTime.getFullYear() + "-" + showMonth + "-" + showDay,
					showHour = finishTime.getHours()<10 ? "0"+finishTime.getHours() : finishTime.getHours(),
					showMinutes = finishTime.getMinutes()<10 ? "0"+finishTime.getMinutes() : finishTime.getMinutes(),
					showSeconds = finishTime.getSeconds()<10 ? "0"+finishTime.getSeconds() : finishTime.getSeconds(),
					setTimeFormat = showHour + ":" + showMinutes + ":" + showSeconds;
					aryRsObj[i]["finishDate"] = setDateFormat;
					aryRsObj[i]["finishTime"] = setTimeFormat;
					console.log(setDateFormat + "  " + setTimeFormat);		//為什麼日期時間與json不一樣, 好像加1天了.
				
			} else if( aryRsObj[i]["end"]==true && aryRsObj[i]["finish"]==false ) {
				aryRsObj[i]["finishDate"] = "未達成";
				aryRsObj[i]["failclass"] = "fail";
			}
			
			//顯示小人圖
			var caloriesCount = aryRsObj[i]["Participants"];
				bPicCount = parseInt(caloriesCount / 10),
				sPicCount = caloriesCount % 10,
				bPicAry = [], sPicAry = [];
			//組大圖
			for(var aryi=0; aryi<bPicCount; aryi++) {
				bPicAry.push(" ");
			}
			//組小圖
			for(var aryj=0; aryj<sPicCount; aryj++) {
				sPicAry.push(" ");
			}

			aryRsObj[i]["bigPicAry"] = bPicAry;
			aryRsObj[i]["smallPicAry"] = sPicAry;

			var challengeRow = aryRsObj[i];
			console.log("能量競賽");
			$("#tmplItemKcalAndTime").tmpl(aryRsObj[i]).appendTo("#tmplKcalAndTime");

		} else if( aryRsObj[i]["type"] == "time" ) {
			// 持久競賽
			var startDate = new Date(aryRsObj[i]["during"][0]), 
				endDate = new Date(aryRsObj[i]["during"][1]), 
				showStartMonth = (startDate.getMonth()+1)<10? "0"+(startDate.getMonth()+1) : (startDate.getMonth()+1),
				showStartDay = startDate.getDate()<10 ? "0"+startDate.getDate() : startDate.getDate(),
				startDateFormat = startDate.getFullYear() + "-" + showStartMonth + "-" + showStartDay,
				showEndMonth = (endDate.getMonth()+1)<10? "0"+(endDate.getMonth()+1) : (endDate.getMonth()+1),
				showEndDay = endDate.getDate()<10 ? "0"+endDate.getDate() : endDate.getDate(),
				endDateFormat = endDate.getFullYear() + "-" + showEndMonth + "-" + showEndDay;
				
			// 設定旗幟的標頭文字
			aryRsObj[i]["flagTitleName"] = "持久競賽";
			aryRsObj[i]["raceRange"] = startDateFormat+" ~ "+endDateFormat;
			
			if( aryRsObj[i]["end"]==true && aryRsObj[i]["finish"]!=false ) {
				console.log("顯示達成的時間");
				var finishTime = new Date(aryRsObj[i]["finish"]),
					showMonth = (finishTime.getMonth()+1)<9 ? "0"+(finishTime.getMonth()+1) : (finishTime.getMonth()+1),
					showDay = finishTime.getDate()<10 ? "0"+finishTime.getDate() : finishTime.getDate(),
					setDateFormat = finishTime.getFullYear() + "-" + showMonth + "-" + showDay,
					showHour = finishTime.getHours()<10 ? "0"+finishTime.getHours() : finishTime.getHours(),
					showMinutes = finishTime.getMinutes()<10 ? "0"+finishTime.getMinutes() : finishTime.getMinutes(),
					showSeconds = finishTime.getSeconds()<10 ? "0"+finishTime.getSeconds() : finishTime.getSeconds(),
					setTimeFormat = showHour + ":" + showMinutes + ":" + showSeconds;
					aryRsObj[i]["finishDate"] = setDateFormat;
					aryRsObj[i]["finishTime"] = setTimeFormat;
					console.log(setDateFormat + "  " + setTimeFormat);		//為什麼日期時間與json不一樣, 好像加1天了.
				
			} else if( aryRsObj[i]["end"]==true && aryRsObj[i]["finish"]==false ) {
				aryRsObj[i]["finishDate"] = "未達成";
				aryRsObj[i]["failclass"] = "fail";
			}
			
			//顯示小人圖
			var caloriesCount = aryRsObj[i]["Participants"];
				bPicCount = parseInt(caloriesCount / 10),
				sPicCount = caloriesCount % 10,
				bPicAry = [], sPicAry = [];
			//組大圖
			for(var aryi=0; aryi<bPicCount; aryi++) {
				bPicAry.push(" ");
			}
			//組小圖
			for(var aryj=0; aryj<sPicCount; aryj++) {
				sPicAry.push(" ");
			}

			aryRsObj[i]["bigPicAry"] = bPicAry;
			aryRsObj[i]["smallPicAry"] = sPicAry;

			var challengeRow = aryRsObj[i];
			console.log("持久競賽");
			$("#tmplItemKcalAndTime").tmpl(aryRsObj[i]).appendTo("#tmplKcalAndTime");

		}
	}
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
