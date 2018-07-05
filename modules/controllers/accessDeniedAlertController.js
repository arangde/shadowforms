var app = angular.module('Fineform');

app.controller('accessDeniedAlertController', ['$scope', '$uibModalInstance', 'storageService', function ($scope, $uibModalInstance, storageService) {
	
	$scope.ok = function () {
		$uibModalInstance.close();
		storageService.clear();
	};
}]);