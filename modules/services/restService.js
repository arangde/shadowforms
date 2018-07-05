/**
 *Author : Harish Mistry
 *Created Date : 01 March 2016
 *Usage : this service is used to call rest apis.
 **/

'use strict';
var app = angular.module('Fineform');
app.config(function($httpProvider) {
	//Enable cross domain calls
	$httpProvider.defaults.useXDomain = true;

	//Remove the header used to identify ajax call that would prevent CORS from working
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

app.service('restService', ['$q', '$http', function($q, $http) {
	this.request = function(url, method, params, access_token) {
		params = params || {};

		var headers = {
			'Content-Type': 'application/json'
		};

		if(access_token === undefined) {
			headers = {
				'Content-Type': 'application/json'
			};
		} else {
			headers = {
				'Content-Type': 'application/json',
				'fineform-access-token': access_token
			};
		}

		var defer = $q.defer();
		$http({
			method: method,
			url: url,
			data: params,
			headers: headers,
			dataType: 'json',
			cache: false
		}).then(function(response) {
			defer.resolve(response);
		}).catch(function(response) {
			defer.reject(response);
		});

		return defer.promise;
	};

	this.upload = function(url, data, access_token) {
		data = data || {};

		var headers = {
			'Content-Type': undefined
		};

		if(access_token === undefined) {
			headers = {
				'Content-Type': undefined
			};
		} else {
			headers = {
				'Content-Type': undefined,
				'fineform-access-token': access_token
			};
		}

		var defer = $q.defer();
		$http.post(url, data, {
			transformRequest: angular.identity,
			headers: headers
		}).success(function(response) {
			defer.resolve(response);
		}).error(function(response) {
			defer.resolve(response);
		});

		return defer.promise;
	};
}]);
