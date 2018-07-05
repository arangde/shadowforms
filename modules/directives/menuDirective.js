/**
 *Author : Harish Mistry
 *Created Date : 01 March 2016
 *Usage : this directive is used to define menu template.
 **/

'use strict';
var app = angular.module('Fineform');

app.directive('menuDirective', function() {
	return {
		templateUrl: 'views/templates/menu.html'
	};
});
