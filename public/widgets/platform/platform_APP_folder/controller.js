Kamato.register.controller('appFolderCtrl', function ($scope, $http, $modal, ngDialog, $rootScope){
// ====================== APP管理 top======================
	$scope.app_oper = [
		// {'tip': 'Home', 'icon': 'sa-list-home'},
		{'tip': 'Back', 'icon': 'sa-list-back', 'link': '#/platform/APP'},
		{'tip': 'Activity', 'icon': 'sa-list-activity', 'link': '#/platform/APP_activity'},
		{'tip': 'Info.', 'icon': 'sa-list-info','link': '#/platform/APP_info'},
		{'tip': 'Folder', 'icon': 'sa-list-folder', 'link': '#/platform/APP_folder'},
		// {'tip': 'Upload', 'icon': 'sa-list-upload', 'link': '#/platform/APP/upload'}
	];


	$scope.fileNameChange = function(elem){
		$scope.files = elem.files;	
		$scope.$apply();
	}

	$scope.test_file= {
			'Path':'public/',
			'files':[
				{'datatype': 'folder', 'name': 'css', 'icon': 'sa-list-folder','file_size': '', 'Last_revise': '2014/11/25'},
				{'datatype': 'folder', 'name': 'js', 'icon': 'sa-list-folder','file_size': '', 'Last_revise': '2014/11/25'},
				{'datatype': 'folder', 'name': 'lib', 'icon': 'sa-list-folder','file_size': '', 'Last_revise': '2014/11/25'},
				{'datatype': 'folder', 'name': 'simple', 'icon': 'sa-list-folder','file_size': '', 'Last_revise': '2014/11/25'},
				{'datatype': 'folder', 'name': 'widget', 'icon': 'sa-list-folder','file_size': '', 'Last_revise': '2014/11/25'},
				{'datatype': 'html', 'name': 'index.html', 'icon': 'sa-list-file','file_size': '234kb', 'Last_revise': '2014/11/25'},
				{'datatype': 'txt', 'name': 'README.md', 'icon': 'sa-list-file','file_size': '234kb', 'Last_revise': '2014/11/25'},
			],
		}
// ====================== APP管理 bottom======================

});