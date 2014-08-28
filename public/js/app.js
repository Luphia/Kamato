'use strict';

/* App Module */
var Kamato = angular.module('Kamato', [
	'ngRoute',
	'KamatoControllers',
	'socket-io',
	'google-maps'
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

(function() {
       var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
       po.src = 'https://apis.google.com/js/client:plusone.js';
       var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
     })();