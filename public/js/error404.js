'use strict';

/* App Module */
var Error = angular.module('Error', [
	'ErrorControllers'
]);

var ErrorControllers = angular.module('ErrorControllers', []);
ErrorControllers.controller('404', function($scope, $window) {
	$scope.content = decodeURIComponent($window.location.pathname.substr(1));

	$scope.search = function() {
		var url = "https://www.google.com/#q=" + encodeURIComponent($scope.content);
		$window.open(url);
	};
});