var app = angular.module('Fineform');

app.controller('accountsController', ['$scope', '$rootScope', '$location', 'constant', 'restService', 'storageService', function($scope, $rootScope, $location, constant, restService, storageService){

	// Define alias for controller.
	var accountsCtrlr = this;

	// Define controller object.
	accountsCtrlr.user = {
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	};

	// Define controller actions.
	accountsCtrlr.resetPassword = function () {
		accountsCtrlr.user.currentPassword = '';
		accountsCtrlr.user.newPassword = '';
		accountsCtrlr.user.confirmPassword = '';
	};

	accountsCtrlr.changePassword = function() {
		function validate(user) {
			var validated = true;
			if (user.currentPassword.trim() == '' || user.currentPassword.trim().length == 0) {
				validated = false;
				$scope.showError('Please enter current password.');
			} else if (user.newPassword.trim() == '' || user.newPassword.trim().length == 0) {
				validated = false;
				$scope.showError('Please enter new password.');
			} else if (user.newPassword.length < 6) {
				validated = false;
				$scope.showError('Please enter new password minimum of 6 characters.');
			} else if(user.currentPassword.trim() == user.newPassword.trim()) {
				validated = false;
				$scope.showError('New password should not be equal to current one.');
			} else if (user.confirmPassword == '' || user.confirmPassword.length == 0) {
				validated = false;
				$scope.showError('Please enter confirm password.');
			} else if(user.newPassword != user.confirmPassword) {
				validated = false;
				$scope.showError('Password do not match.');
			}

			return validated;
		}

		function save(user) {
			$rootScope.activityInProgress = true;

			var params = {
				currentPassword: user.currentPassword.trim(),
				newPassword: user.newPassword.trim()
			};

			var changePasswordURL = constant.apiURL + '/admin/change-password';
			var user_info = storageService.get('user_info');

			restService.request(changePasswordURL, 'POST', params, user_info.access_token).then(function(response) {
				$rootScope.activityInProgress = false;
				accountsCtrlr.resetPassword();
				if ('response_message' in response.data) {
					$scope.showSuccess(response.data.response_message);
				}
			}).catch(function(response) {
				$rootScope.activityInProgress = false;
				if ('response_message' in response.data) {
					$scope.showError(response.data.response_message);
				}
			});
		}

		if (validate(accountsCtrlr.user)) {
			save(accountsCtrlr.user);
		}
    };
}]);
