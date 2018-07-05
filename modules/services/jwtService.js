/**
 *Author : Harish Mistry
 *Created Date : 01 March 2016
 *Usage : this service is used to encode & decode jwt tokensin angular js environment
 **/

'use strict';
var app = angular.module('Fineform');

app.service('jwtService', ['$window', function($window) {
    function decrypt(token) {
        var body = token.split(".");
        if(body.length >= 2) {
            var uHeader = b64utos(body[0]);
            var uClaim = b64utos(body[1]);
            var pHeader = KJUR.jws.JWS.readSafeJSONString(uHeader);
            var pClaim = KJUR.jws.JWS.readSafeJSONString(uClaim);
            return pClaim;
        } else {
            return undefined;
        }
    }

    var decode = function(token) {
		return decrypt(token);
	};

	var encode = function(payload) {
		return payload;
	};

    return {
		decode: decode,
		encode: encode
    };
}]);
