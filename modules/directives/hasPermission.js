/**
 *Author : Harish Mistry
 *Created Date : 01 March 2016
 *Usage : this directive is used to define has permission attribute.
 **/

'use strict';
var app = angular.module('Fineform');

app.directive('hasPermission', function(permissionFactory) {
	return {
        restrict: 'A',
        link: function(scope, element, attrs) {
			if(!angular.isString(attrs.hasPermission)) {
				throw 'hasPermission value must be a string';
            }

			var value = attrs.hasPermission.trim();
            var notPermissionFlag = value[0] === '!';
            if(notPermissionFlag) {
                value = value.slice(1).trim();
            }

			var permissions = value.split(',');
			var hasPermission = permissionFactory.hasPermissions(permissions);
			if(hasPermission && !notPermissionFlag || !hasPermission && notPermissionFlag) {
				element.show();
			} else {
				element.hide();
			}
        }
	};
});
