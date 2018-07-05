/**
 *Author : Harish Mistry
 *Created Date : 10 March 2016
 *Usage : To define value this module will be used.
 **/

/**
usage example.

app.config(function ($provide) {
    $provide.decorator('greeting', function ($delegate) {
        return $delegate + ' World!';
    });
});
**/
 
'use strict';
var app = angular.module('Fineform');

app.value('greeting', 'Hello world');