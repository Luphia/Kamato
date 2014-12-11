Kamato.register.controller('MediaCtrl', function($scope, $http) {
	$scope.medias = [
		{"title": "Legal High 001", "src": "/public/LHEP001.mp4", "poster": "/public/LHEP001.jpg"},
		{"title": "Legal High 002", "src": "/public/LHEP002.mp4", "poster": "/public/LHEP002.jpg"},
		{"title": "Legal High 003", "src": "/public/LHEP003.mp4", "poster": "/public/LHEP003.jpg"},
		{"title": "Legal High 004", "src": "/public/LHEP004.mp4", "poster": "/public/LHEP004.jpg"},
		{"title": "Legal High 005", "src": "/public/LHEP005.mp4", "poster": "/public/LHEP005.png"},
		{"title": "Legal High 006", "src": "/public/LHEP006.mp4", "poster": "/public/LHEP006.png"},
		{"title": "Legal High 007", "src": "/public/LHEP007.mp4", "poster": "/public/LHEP007.png"},
		{"title": "Legal High 008", "src": "/public/LHEP008.mp4", "poster": "/public/LHEP008.png"},
		{"title": "Legal High 009", "src": "/public/LHEP009.mp4", "poster": "/public/LHEP009.png"},
		{"title": "Legal High 010", "src": "/public/LHEP010.mp4", "poster": "/public/LHEP010.png"},
		{"title": "Legal High 011", "src": "/public/LHEP011.mp4", "poster": "/public/LHEP011.png"}
	];
	$scope.play = $scope.medias[0];
	$scope.choose = function(m) {
		$scope.play = m;
	};

});