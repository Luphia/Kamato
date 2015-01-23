Kamato.register.controller('SummaryCtrl', ['$scope', '$http', function($scope, $http) {
	/*
	$http.get('./data/cases.json').success(function(data) {
		$scope.cases = data;
	});
	*/

	$scope.login = function() {
		var data = {account: $scope.account, password: $scope.password}
		$http.post('/login', data).success(function(_data, _status, _headers, _config) {
			console.log(_data);
		}).
		error(function(_data, _status, _headers, _config) {
			console.log(_data);
		});
	};
}]);