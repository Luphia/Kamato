module.exports = function() {
	var init = function() {
		return this;
	};

	/**
	 * 現在日期
	 * return YYYY-MM-DD 的日期(String)
	 */
	var nowDate = function() {
		// GET CURRENT DATE
		var date = new Date();
		 
		// GET YYYY, MM AND DD FROM THE DATE OBJECT
		var yyyy = date.getFullYear().toString();
		var mm = (date.getMonth()+1).toString();
		var dd  = date.getDate().toString();
		 
		// CONVERT mm AND dd INTO chars
		var mmChars = mm.split('');
		var ddChars = dd.split('');
		 
		// CONCAT THE STRINGS IN YYYY-MM-DD FORMAT
		var datestring = yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
		return datestring;
	};

	
	/**
	 * 判斷該xx年xx月下的，這個月的天數。
	 * param {year} 年(Number)
	 * param {month} 月(Number)
	 * return (Number)天數
	 */
	var daysInMonth = function(year, month) {
		return 32 - new Date(year, month-1, 32).getDate();
	};
	
	var calendar = {
		init: init,
		nowDate: nowDate,
		daysInMonth: daysInMonth
	};
	return calendar.init();
};