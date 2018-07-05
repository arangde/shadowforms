var app = angular.module('Fineform');

app.controller('loginController', ['$scope', '$rootScope', '$location', 'constant', 'restService', 'storageService', function($scope, $rootScope, $location, constant, restService, storageService){

	// Define alias for controller.
	var loginCtrlr = this;

	// Define controller actions.
	loginCtrlr.loginError = loginError;
	function loginError() {
		return loginCtrlr.error_message.length > 0;
	}

	loginCtrlr.hideLoginError = hideLoginError;
	function hideLoginError() {
		loginCtrlr.error_message = '';
	}

	loginCtrlr.submit = submit;
	function submit() {
		var regexEmail = /^[\w]+(\.[\w]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

		if (loginCtrlr.username == undefined || loginCtrlr.username == '' || loginCtrlr.username.length == 0) {
			loginCtrlr.error_message = 'Please enter username';
		} else if (!regexEmail.test(loginCtrlr.username)) {
			loginCtrlr.error_message = 'Please enter valid username';
		} else if (loginCtrlr.password == undefined || loginCtrlr.password == '' || loginCtrlr.password.length == 0) {
			loginCtrlr.error_message = 'Please enter password';
		} else {
			$rootScope.activityInProgress = true;
			loginCtrlr.error_message = '';

			var loginURL = constant.apiURL + '/admin/signin';
			var params = {
				'username': loginCtrlr.username,
				'password': loginCtrlr.password
			};

			restService.request(loginURL, 'POST', params).then(function(response) {
				$rootScope.activityInProgress = false;
				if((response.status == 200) && (response.data)) {
					var userInfo = response.data.response_data;
					storageService.set('user_info', userInfo);
					$location.path('/dashboard');
				} else {
					loginCtrlr.error_message = 'Something went wrong.';
				}
			}).catch(function(response) {
				$rootScope.activityInProgress = false;
				if(response.data) {
					var error_data = response.data;
					try {
						if('error_info' in error_data.response_data) {
							loginCtrlr.error_message = error_data.response_data.error_info[0].msg;
						} else {
							loginCtrlr.error_message = error_data.response_message;
						}
					} catch(exception) {
						loginCtrlr.error_message = error_data.response_message;
					}
				} else {
					loginCtrlr.error_message = 'Please check your internet connection.';
				}
			});
		}
	}
}]);
