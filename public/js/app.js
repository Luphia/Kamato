'use strict';

/* App Module */
var Kamato = angular.module('Kamato', [
	'ngRoute',
	'KamatoControllers',
	'socket-io'
]);

Kamato.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: 'widgets/summary/template.html',
		controller: 'SummaryCtrl'
	}).
	when('/map', {
		templateUrl: 'widgets/map/template.html',
		controller: 'MapCtrl'
	}).
	when('/chat/:chatID', {
		templateUrl: 'widgets/chat/template.html',
		controller: 'ChatCtrl'
	}).
	otherwise({
		redirectTo: '/'
	});
}]);

Kamato.directive('message', function($compile) {
    return {
		restrict: 'E',
		replace: true,
		templateUrl: 'widgets/chat/template-message.html'
	}
});

/* get location data */
navigator.geolocation.getCurrentPosition(
	function (pos) {
		var crd = pos.coords;

		console.log('Your current position is:');
		console.log('Latitude : ' + crd.latitude);
		console.log('Longitude: ' + crd.longitude);
		console.log('More or less ' + crd.accuracy + ' meters.');
	},
	function (err) {
		console.warn('ERROR(' + err.code + '): ' + err.message);
	},
	{
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	}
);