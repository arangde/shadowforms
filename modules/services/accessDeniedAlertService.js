/**
 *Author : Harish Mistry
 *Created Date : 01 March 2016
 *Usage : this service is used to open access denied alert.
 **/
 
'use strict';
var app = angular.module('Fineform');

app.service('accessDeniedAlertService', ['$uibModal', function($uibModal) {
    return {
        show: function(size) {
			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: 'views/templates/access_denied_alert.html',
				controller: 'accessDeniedAlertController',
				backdrop: 'static',
				size: size,
			});
			
            return modalInstance;
        }
    }
}]);