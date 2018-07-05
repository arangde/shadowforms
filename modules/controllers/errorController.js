var app = angular.module('Fineform');

app.controller('errorController', ['$scope', '$rootScope', '$location', 'constant', 'restService', 'storageService', function($scope, $rootScope, $location, constant, restService, storageService){

	// Define alias for controller.
	var errorCtrlr = this;

	// Define controller actions.
	errorCtrlr.init = function init() {
	};
}]);
