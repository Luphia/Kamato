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

function loadCss(url) {
	if(document.getElementById(url)) { console.log(url); return false; }
	var link = document.createElement("link");
	link.type = "text/css";
	link.rel = "stylesheet";
	link.href = url;
	link.id = url;
	document.getElementsByTagName("head")[0].appendChild(link);
}

/* App Module */
var Kamato = angular.module('Kamato', [
	'ngRoute',
	'KamatoControllers',
	'socket-io',
	'google-maps',
	'luegg.directives'
]);

Kamato.config(function($controllerProvider, $compileProvider, $filterProvider, $routeProvider, $provide) {
	Kamato.register = {
		controller: $controllerProvider.register,
		directive: $compileProvider.directive,
		filter: $filterProvider.register,
		route: $routeProvider,
		factory: $provide.factory,
		service: $provide.service
	};

	$routeProvider.when('/', {
		templateUrl: './widgets/login/template.html',
		resolve: {
			load: function($q, $route, $rootScope) {
				var deferred = $q.defer();
				var dependencies = ['./widgets/login/controller.js'];

				loadCss('./widgets/login/style.css');

				$script(dependencies, function () {
					$rootScope.$apply(function() {
						deferred.resolve();
					});
				});

				return deferred.promise;
			}
		}
	}).
	when('/:widget', {
		templateUrl: function(path) {
			return './widgets/' + path.widget + '/template.html';
		},

		resolve: {
			load: function($q, $route, $rootScope) {
				var deferred = $q.defer();
				var dependencies = ['./widgets/' + $route.current.params.widget + '/controller.js'];

				loadCss('./widgets/' + $route.current.params.widget + '/style.css');

				$script(dependencies, function () {
					$rootScope.$apply(function() {
						deferred.resolve();
					});
				});

				return deferred.promise;
			}
		}
	}).
	when('/platform/:widget', {
		templateUrl: function(path) {
			return './widgets/platform/platform_' + path.widget + '/template.html';
		},

		resolve: {
			load: function($q, $route, $rootScope) {
				var deferred = $q.defer();
				var dependencies = ['./widgets/platform/platform_' + $route.current.params.widget + '/controller.js'];

				loadCss('./widgets/platform/platform_' + $route.current.params.widget + '/style.css');

				$script(dependencies, function () {
					$rootScope.$apply(function() {
						deferred.resolve();
					});
				});

				return deferred.promise;
			}
		}
	}).
	otherwise({
		redirectTo: '/'
	});;
});

Kamato.controller('TemplateCtrl',  function($scope){
	
	$scope.profile_menu =[
		{'title':'My Profile'},
		{'title': 'Messages'},
		{'title': 'Settings'},
		{'title': 'Sign Out'}
	];

	$scope.sidebar= [
		{'name': 'APP管理', 'link': '#/platform/APP', 'icon': 'sa-side-app'},
		{'name': 'EasyDB Manager', 'link': '#/platform/easydb', 'icon': 'sa-side-db'},
		{'name': 'Channel Manager', 'link': '#/platform/channel', 'icon': 'sa-side-channel'},
		{'name': 'API Manager', 'link': '#/platform/api', 'icon': 'sa-side-auth'},
		{'name': '外部資源託管', 'link': '#/platform/resource', 'icon': 'sa-side-resource'}
	];
	$scope.selected = undefined;
	$scope.active = function(menu) {
		$scope.selected = menu.name;
	}
});

Kamato.directive('row', function($compile) {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'widgets/platform/template-row.html'
	}
});

Kamato.directive('chart', function() {
	return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            var rawdata = scope[attrs.id];
            var chart = null;

            var options = {
                series: {
                    lines: {
                        show: true,
                        lineWidth: 1,
                        fill: 0.25,
                    },
                    color: 'rgba(255,255,255,0.7)',
                    shadowSize: 0,
                    points: {
                        show: true,
                    }
                },

                yaxis: {
                    // min: 0,
                    // max: 20,
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
				    mode: "time",
               		timeformat:"%H:%M:%S",
               		timezone: "browser",
                	tickSize: [5, "second"], // 顯示一筆資料的間隔
                	// min: 1,
                	// max: 30,
                	// tickSize: 1,
                	// tickColor: 'red',
                    // tickColor: 'rgba(255,255,255,0)', //文字顏色
                    // tickDecimals: 0, //小數點
                    font :{
                        lineHeight: 13,
                        style: "normal",
                        color: "rgba(255,255,255,0.8)",
                    }
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
                    show: false,  //顯示資料方塊
          
                }
            }

            var label;
            if( attrs.id == "connectors"){
            	label = 'Connectors';
            }
            else if(attrs.id == "msgs"){
            	label = 'Messages';
            }
            else{
            	label = attrs.id;
            }

        	chart = $.plot(elem, [{data: rawdata,}], options);
            elem.show();
	
    		var pre_point = null;
            elem.bind("plothover", function(event, pos, item){
				if(item){
					if(pre_point != item.dataIndex){
						pre_point = item.dataIndex;   //檢查滑鼠是否停留在同一點
						var x = item.datapoint[0];
						var y = item.datapoint[1];
						var date = new Date(x);
						 var div = document.createElement("div");
						 var class_name = document.createAttribute("class");
						 var style = document.createAttribute("style");
						 class_name.value = "toolTip";
						 if( item.pageY <76 || item.pageX < 110){
						 	style.value = "top:"+(item.pageY)+"px; left:"+(item.pageX)+"px";
						 }
						 else{
						 	style.value = "top:"+(item.pageY)+"px; left:"+(item.pageX-110)+"px";
						 }
   						 div.innerHTML = '<p>Time: '+date.toLocaleTimeString()+'</p><p>'+label+': '+y+'</p>';
						 div.setAttributeNode(style);
						 div.setAttributeNode(class_name);
						 document.body.appendChild(div);
					}
				}  
				//toolTip不是第一次出現
				else if((document.getElementsByClassName("toolTip").length)>0){		
					pre_point = null;
					var tooltip = document.getElementsByClassName("toolTip");
					for( var i = 0 ; i < tooltip.length ; i++){
						tooltip[i].remove();
					}
				}
            });	
		}
	};
});

Kamato.directive('ngEnter', function() {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			if(event.which === 13) {
				scope.$apply(function() {
					scope.$eval(attrs.ngEnter);
				});

				event.preventDefault();
			}
		});
	};
});

Kamato.directive('activitychart', function() {
	return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            var rawdata = scope[attrs.id];
            var chart = null;
            var options = {
                series: {
                    lines: {
                        show: true,
                        lineWidth: 1,
                        fill: 0.25,
                    },
                    color: 'rgba(255,255,255,0.7)',
                    shadowSize: 0,
                    points: {
                        show: true,
                    }
                },

                yaxis: {
                    // min: 0,
                    // max: 20,
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
				    mode: "time",
               		timeformat:"%Y/%m/%d",
               		timezone: "browser",
                	tickSize: [5, "day"], // 顯示每一筆資料彼此間隔的差距
                	// min: 1,
                	// max: 30,
                	// tickSize: 1,
                	// tickColor: 'red',
                    // tickColor: 'rgba(255,255,255,0)', //文字顏色
                    // tickDecimals: 0, //小數點
                    font :{
                        lineHeight: 13,
                        style: "normal",
                        color: "rgba(255,255,255,0.8)",
                    }
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
                    show: false,  //顯示資料方塊
          
                }
            }

            var label;
            	label = attrs.id;

        	chart = $.plot(elem, [{data: rawdata,}], options);
            elem.show();
	
    		var pre_point = null;
            elem.bind("plothover", function(event, pos, item){
				if(item){
					if(pre_point != item.dataIndex){
						pre_point = item.dataIndex;   //檢查滑鼠是否停留在同一點
						var x = item.datapoint[0];
						var y = item.datapoint[1];
						var date = new Date(x);
						 var div = document.createElement("div");
						 var class_name = document.createAttribute("class");
						 var style = document.createAttribute("style");
						 class_name.value = "toolTip";
						 if( item.pageY <76 || item.pageX < 110){
						 	style.value = "top:"+(item.pageY)+"px; left:"+(item.pageX)+"px";
						 }
						 else{
						 	style.value = "top:"+(item.pageY)+"px; left:"+(item.pageX-110)+"px";
						 }
   						 div.innerHTML = '<p>Date: '+date.toLocaleDateString()+'</p><p>'+label+': '+y+'</p>';
						 div.setAttributeNode(style);
						 div.setAttributeNode(class_name);
						 document.body.appendChild(div);
					}
				}  
				//toolTip不是第一次出現
				else if((document.getElementsByClassName("toolTip").length)>0){		
					pre_point = null;
					var tooltip = document.getElementsByClassName("toolTip");
					for( var i = 0 ; i < tooltip.length ; i++){
						tooltip[i].remove();
					}
				}
            });	
		}
	};
});