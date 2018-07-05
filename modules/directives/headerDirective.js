/**
 *Author : Harish Mistry
 *Created Date : 01 March 2016
 *Usage : this directive is used to define header template.
 **/
 
'use strict';
var app = angular.module('Fineform');

app.directive('headerDirective', function() {
	return {
		templateUrl: 'views/templates/header.html'
	};
});