/**
 *Author : Harish Mistry
 *Created Date : 01 March 2016
 *Usage : this directive is used to define activity indicator template.
 *Reference: https://ponyfoo.com/articles/angle-brackets-synergistic-directives
 **/

'use strict';
var app = angular.module('Fineform');

app.directive('activityIndicatorDirective', function() {
	var definition = {
		restrict: 'E',
		templateUrl: 'views/templates/activity_indicator_directive.html',
		scope: false
	};

	return definition;
});
