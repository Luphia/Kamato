var parseKeys = function(data) {
	var keys = [];
	if(data.length > 1) {
		for(var key in data[0]) {
			keys.push(key);
		}
	}
	else {
		for(var key in data) {
			keys.push(key);
		}
	}
console.log(keys);
	return keys;
};

Kamato.register.controller('DataflowCtrl', function ($scope, $http, $modal, ngDialog, $rootScope) {

	$scope.collections = [];
	$scope.keys = parseKeys($scope.collections);
	$scope.cost = { "fetch": 0, "index": 0 };

	$scope.source = "http://opendata.epa.gov.tw/ws/Data/AQX/?$orderby=PSI&$skip=0&$top=1000&format=json";
	$scope.sql = 'select * from table where PM10 > 150';

	$scope.updatePath = function() {
		$scope.url = "/api?source=" + encodeURIComponent($scope.source) + "&sql=" + encodeURIComponent($scope.sql);
		$scope.outer = "http://simple.tanpopo.cc" + $scope.url;
	};
	$scope.fetch = function(path, sql) {
		$scope.loading = true;
		$scope.updatePath();
		$http.get($scope.url).success(function(data, status, headers, config) {
			$scope.parseData(data);
			$scope.loading = false;
		}).error(function(data, status, headers, config) {
			console.log(data);
			console.log(status);
			console.log(headers);
			$scope.loading = false;
  		});;
	};
	$scope.parseData = function(result) {
		$scope.keys = parseKeys(result.data);
		$scope.cost = result.cost;
		$scope.collections = result.data;
		
	};

	$scope.updatePath();
	$scope.fetch();
});
