/**
 *Author : Harish Mistry
 *Created Date : 01 March 2016
 *Usage : this facotry is used to define has permissions.
 **/

'use strict';
var app = angular.module('Fineform');

app.factory('permissionFactory', ['$rootScope', 'storageService', 'jwtService', function ($rootScope, storageService, jwtService) {
    return {
        hasPermissions: function(permissions) {
            var hasPermission = true;
            var user_info = storageService.get('user_info');
            var payload = jwtService.decode(user_info.access_token);
            if (payload === undefined) {
                hasPermission = false;
            } else {
                var role = permissions.find(function (currentValue, index, arr) { return (arr[index] === payload.role); });
    			if (role === undefined) {
    				hasPermission = false;
    			}
            }

            return hasPermission;
        }
    };
}]);
