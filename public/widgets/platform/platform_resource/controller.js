Kamato.register.controller('resourceCtrl', function ($scope, $http, $modal, ngDialog, $rootScope){
	// ====================== Resource top======================
	$scope.newAccountDialog = function(){
		$scope.account = {
			GoogleDrive: 'GoogleDrive',
			Dropbox: 'Dropbox',
		};
		var modalInstance = $modal.open({
			templateUrl: 'newAccountInfo',
			controller: 'createAccountCrtl',
			size: 'lg',
			resolve:{
		        account: function () {
		          return $scope.account;
      		  }
			}
		});
	}

	$scope.max_cap = 0;
	$scope.change_cap = function(change_cap) {
		$scope.max_cap = $scope.max_cap +change_cap;
		$scope.cap = 4.7;

		$scope.percent = Math.floor(($scope.cap/$scope.max_cap)*1000)/10;

			if($scope.percent<=50){
				$scope.type = "info";
			}
			else if($scope.percent<=80){
				$scope.type = "warning";
			}
			else {
				$scope.type ="danger";
			}	
	}


	$scope.account_list = [];
	$scope.change_cap(5);

	$rootScope.$on('list', function(arg_name, account){
			$scope.account_list.push(account);
			var add_cap =  $scope.account_list[$scope.account_list.length-1].capacity;
			$scope.change_cap(add_cap);
		});

	$scope.del_account = function(del_account) {
		var del_cap = -(del_account.capacity);
		$scope.change_cap(del_cap);
		$scope.account_list.splice($scope.account_list.indexOf(del_account.del_account),1);
	}
	// ====================== Resource bottom======================
});