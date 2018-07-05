/**
 *Author : Harish Mistry
 *Created Date : 01 March 2016
 *Usage : this service is used to set data to local storageService and get data from local storageService
 **/
 
'use strict';
var app = angular.module('Fineform');

app.service('storageService', ['$window', function($window) {
    return {
        get: function(key) {
			if($window.localStorage[key]) {
				var data = angular.fromJson($window.localStorage[key]);
				return data;
            }
			
            return undefined;
        },
        set: function(key, val) {
            if(val === undefined) {
                $window.localStorage.removeItem(key);
            } else {
                $window.localStorage[key] = angular.toJson(val);
            }
        },
        remove: function(key) {
            if($window.localStorage[key]) {
				$window.localStorage.removeItem(key);
            }
        },
		clear: function() {
			$window.localStorage.clear();
			$window.location.reload();
		}
    }
}]);