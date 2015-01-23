'use strict';

function fakeNgModel(initValue){
	return {
		$setViewValue: function(value){
			this.$viewValue = value;
		},
		$viewValue: initValue
	};
}

angular.module('luegg.directives', []).directive('scrollGlue', function() {
	return {
		priority: 1,
		require: ['?ngModel'],
		restrict: 'A',
		link: function(scope, $el, attrs, ctrls) {
			var el = $el[0],
				ngModel = ctrls[0] || fakeNgModel(true);

			var lastPos = 0;
			var scrollToBottom = function() {
				el.scrollTop = el.scrollHeight;
			};

			var shouldActivateAutoScroll = function() {
				// + 1 catches off by one errors in chrome
				return el.scrollTop + el.clientHeight + 1 >= el.scrollHeight;
			};

			scope.$watch(function() {
				if(ngModel.$viewValue){
					scrollToBottom();
				}
			});

			$el.bind('scroll', function() {
				var activate = shouldActivateAutoScroll();
				if(activate !== ngModel.$viewValue){
					scope.$apply(ngModel.$setViewValue.bind(ngModel, activate));
				}
			});
		}
	};
});

/* App Module */
var Kamato = angular.module('Kamato', [
	'ngRoute',
	'KamatoControllers',
	'socket-io',
	'google-maps',
	'luegg.directives'
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
	when('/media', {
		templateUrl: 'widgets/media/template.html',
		controller: 'MediaCtrl'
	}).
	when('/platform', {
		templateUrl: 'widgets/platform/template.html',
		controller: 'PlatformCtrl'
	}).
	when('/artmatch', {
		templateUrl: 'widgets/artmatch/template.html',
		controller: 'ArtmatchCtrl'
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

Kamato.directive('pin', function($compile) {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'widgets/chat/template-pin.html'
	}
});