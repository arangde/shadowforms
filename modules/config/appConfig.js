/**
 *Author : Harish Mistry
 *Created Date : 01 March 2016
 *Usage : this config is used to set app default routing.
 **/

'use strict';
var app = angular.module('Fineform');

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
	$routeProvider.when('/login', {
		controller: "loginController",
		templateUrl: 'views/login/login.html',
		controllerAs: 'loginCtrlr'
    }).when('/access-denied', {
		controller: "errorController",
		templateUrl: 'views/error/access-denied.html',
		controllerAs: 'errorCtrlr',
		permissions: ['Administrator']
	}).when('/change-password', {
		controller: "accountsController",
		templateUrl: 'views/accounts/change-password.html',
		controllerAs: 'accountsCtrlr',
		permissions: ['Administrator']
	}).when('/documents', {
		controller: "documentsController",
		templateUrl: 'views/documents/view.html',
		controllerAs: 'documentsCtrlr',
		permissions: ['Administrator']
	}).when('/documents/create', {
		controller: "documentsController",
		templateUrl: 'views/documents/create.html',
		controllerAs: 'documentsCtrlr',
		permissions: ['Administrator']
	}).when('/documents/edit/:id?', {
		controller: "documentsController",
		templateUrl: 'views/documents/edit.html',
		controllerAs: 'documentsCtrlr',
		permissions: ['Administrator'],
		resolve: {
			"check": ['$location', '$route', function($location, $route) {
				if ($route.current.params.id == undefined) {
					$location.path('/documents');
				}
			}]
		}
	}).when('/documents/modify/:id?', {
		controller: "documentsController",
		templateUrl: 'views/documents/modify.html',
		controllerAs: 'documentsCtrlr',
		permissions: ['Administrator'],
		resolve: {
			"check": ['$location', '$route', function($location, $route) {
				if ($route.current.params.id == undefined) {
					$location.path('/documents');
				}
			}]
		}
	}).otherwise({
		resolve: {
			"check": ['$location', 'authProvider', function($location, authProvider) {
				if(authProvider.authenticated()) {
					$location.path('/documents');
				} else {
					$location.path('/login');
				}
			}]
		}
    });
	/*
	// Use the HTML5 History API.
	$locationProvider.html5Mode({
		enabled: true,
		requireBase: true
	});
	*/
}]).run(['$rootScope', '$location', 'authProvider', 'storageService', 'jwtService', function($rootScope, $location, authProvider, storageService, jwtService) {
	$rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
		if(!authProvider.authenticated()) {
			$location.path('/login');
		} else {
			var route = nextRoute.$$route;
			if (route != undefined) {
				if ('permissions' in route) {
					var user_info = storageService.get('user_info');
					var payload = jwtService.decode(user_info.access_token);

					if (payload === undefined) {
						$location.path('/access-denied');
					} else {
						var role = route.permissions.find(function (currentValue, index, arr) { return (arr[index] === payload.role); });
						if (role === undefined) {
							$location.path('/access-denied');
						}
					}
				}
			}
		}
	});
}]);
