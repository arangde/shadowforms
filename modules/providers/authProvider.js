/**
 *Author : Harish Mistry
 *Created Date : 01 March 2016
 *Usage : this provider is used to check if authentication is cleared or not.
 **/

'use strict';
var app = angular.module('Fineform');

app.provider('authProvider', function() {
    return {
        $get: ['storageService', function(storageService) {
            return {
                authenticated: function() {
					try {
						var user_info = storageService.get('user_info');
						if(typeof(user_info) != typeof(undefined)) {
							if('access_token' in user_info) {
								if(user_info.access_token.length > 0) {
									return true;
								}
							}
						}
						
						return false;
					} catch(e) {
						return false;
					}
                }
            };
        }]
    };
});