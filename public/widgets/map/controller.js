Kamato.register.controller('MapCtrl', ['$scope', '$http', function($scope, $http) {
	/* get location data */
	navigator.geolocation.getCurrentPosition(
		function (pos) {
			var crd = pos.coords;

			$scope.map = {
				center: {
					latitude: crd.latitude,
					longitude: crd.longitude
				},
				zoom: 14
			};

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

	$scope.map = {
		center: {
			latitude: 0,
			longitude: 0
		},
		zoom: 5
	};


	var sqrt3 = Math.sqrt(3);
	$scope.size = 30;

	var Point =function(center) {
		var types = ["play", "play", "play", "play", ""];
		var type = types[Math.floor(Math.random()*types.length)];
		var randX = Math.floor(Math.random() * 20);
		var randY = Math.floor(Math.random() * 7);

		if(center) {
			randX = 10;
			randY = 3;
		}

		return {
			x: randX * $scope.size * 1.1 * 1.5,
			y: sqrt3 * (randX % 2 + randY * 2) / 2 * $scope.size * 1.1,
			l: 1,
			o: 10,
			type: type
		};
	};

	var exists = [];
	$scope.positions = [];
	$scope.you = new Point(true);
	$scope.you.o = 100;
	$scope.you.type = "me";
	$scope.positions.push($scope.you);
	exists.push($scope.you.x + "," + $scope.you.y);

	var addChannel = function(render) {
		var point = new Point();
		var aPoint = point.x + "," + point.y;
		var aIndex = exists.indexOf(aPoint);

		if(aIndex == 0) {

		}
		else if(aIndex > -1) {
			$scope.positions[aIndex].l ++;
			var mod6 = $scope.positions[aIndex].l % 6;
			var mod12 = $scope.positions[aIndex].l % 12;
			if(mod12 > 5) {
				$scope.positions[aIndex].o = mod6 * 10;
			}
			else {
				$scope.positions[aIndex].o = (5 - mod6) * 10;
			}
		}
		else {
			$scope.positions.push(point);
			exists.push(aPoint);
		}

		!render && $scope.$apply();
	};
	for(var i = 0; i < 100; i++) {
		addChannel(true);
	}
	setInterval(addChannel, 10);

	$scope.block = {
		width: $scope.size * 2,
		height: $scope.size * sqrt3
	}

	$scope.points = [
		{x: $scope.size * -0.5, y: $scope.size * 0.5 * sqrt3},
		{x: $scope.size * 0.5, y: $scope.size * 0.5 * sqrt3},
		{x: $scope.size * 1, y: $scope.size * 0},
		{x: $scope.size * 0.5, y: $scope.size * -0.5 * sqrt3},
		{x: $scope.size * -0.5, y: $scope.size * -0.5 * sqrt3},
		{x: $scope.size * -1, y: $scope.size * 0}
	];
}]);