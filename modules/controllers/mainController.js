var app = angular.module('Fineform');

app.controller('mainController', ['$scope', '$rootScope', '$location', 'constant', 'restService', 'storageService', 'jwtService', function($scope, $rootScope, $location, constant, restService, storageService, jwtService){

	$rootScope.activityInProgress = false;
	$scope.inProgress = function() {
		return $rootScope.activityInProgress;
	};

	$scope.getClass = function (path) {
		return ($location.path().substr(0, path.length) === path) ? 'active' : '';
	};

	$scope.getUsername = function () {
		var user_info = storageService.get('user_info');
		var payload = jwtService.decode(user_info.access_token);
		if (payload === undefined) {
			return "Welcome, Guest";
		} else {
			return "Welcome, " + payload.username;
		}
	};

	$rootScope.messageInfo = { type: '', message: '' };
	$scope.messageClass = function () {
		if ($rootScope.messageInfo.type === 'info') {
			return 'alert bg-primary';
		} else if ($rootScope.messageInfo.type === 'warning') {
			return 'alert bg-warning';
		} else if ($rootScope.messageInfo.type === 'success') {
			return 'alert bg-success';
		} else if ($rootScope.messageInfo.type === 'error') {
			return 'alert bg-danger';
		} else {
			return '';
		}
	};

	$scope.messageTypeClass = function () {
		if ($rootScope.messageInfo.type === 'info') {
			return 'glyph stroked empty-message';
		} else if ($rootScope.messageInfo.type === 'warning') {
			return 'glyph stroked flag';
		} else if ($rootScope.messageInfo.type === 'success') {
			return 'glyph stroked checkmark';
		} else if ($rootScope.messageInfo.type === 'error') {
			return 'glyph stroked cancel';
		} else {
			return '';
		}
	};

	$scope.messageTypeXLink = function () {
		if ($rootScope.messageInfo.type === 'info') {
			return '#stroked-empty-message';
		} else if ($rootScope.messageInfo.type === 'warning') {
			return '#stroked-flag';
		} else if ($rootScope.messageInfo.type === 'success') {
			return '#stroked-checkmark';
		} else if ($rootScope.messageInfo.type === 'error') {
			return '#stroked-cancel';
		} else {
			return '';
		}
	};

	$scope.message = function() {
		return $rootScope.messageInfo.message;
	};

	$scope.showInfo = function(message) {
		$rootScope.messageInfo.type = 'info';
		$rootScope.messageInfo.message = message;
	};

	$scope.showWarning = function(message) {
		$rootScope.messageInfo.type = 'warning';
		$rootScope.messageInfo.message = message;
	};

	$scope.showSuccess = function(message) {
		$rootScope.messageInfo.type = 'success';
		$rootScope.messageInfo.message = message;
	};

	$scope.showError = function(message) {
		$rootScope.messageInfo.type = 'error';
		$rootScope.messageInfo.message = message;
	};

	$scope.showMessage = function() {
		return (($rootScope.messageInfo.type != '') && ($rootScope.messageInfo.message != ''));
	};

	$scope.hideMessage = function() {
		$rootScope.messageInfo.type = '';
		$rootScope.messageInfo.message = '';
	};

	$scope.logout = function() {
		storageService.clear();
	};
}]);
