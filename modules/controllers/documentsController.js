var app = angular.module('Fineform');

app.controller('documentsController', ['$scope', '$route', '$rootScope', '$location', '$window', 'constant', 'restService', 'storageService', 'accessDeniedAlertService', function($scope, $route, $rootScope, $location, $window, constant, restService, storageService, accessDeniedAlertService){
    // Define alias for controller.
	var documentsCtrlr = this;

	// Define controller object.
	documentsCtrlr.document = {
		id: '',
		pdf: undefined,
		url: '',
		key: '',
		name: '',
		author: '',
		contents: []
	};

	// Define controller objects.
	documentsCtrlr.documents = [];
	documentsCtrlr.checklist = [];

	// Define grid information objects.
	documentsCtrlr.pages		= [5, 10, 25, 50, 100];
	documentsCtrlr.pageSize		= documentsCtrlr.pages[0];
	documentsCtrlr.currentPage	= 1;
	documentsCtrlr.totalRecords	= 0;

	// Define controller actions.
	$scope.file_changed = function(element, scope) {
		$scope.$apply(function(scope) {
			if (element.files[0] !== undefined) {
				if (element.files[0].type === 'application/pdf') {
					documentsCtrlr.document.pdf = element.files[0];
				}
			}

			if (documentsCtrlr.document.pdf === undefined) {
				element.value = "";
				alert('Please select a valid pdf file.');
			}
			/*
			var fd = new FormData();
			fd.append('pdf', element.files[0]);
			*/
		});
	};

	documentsCtrlr.init = function init() {
		$scope.hideMessage();
		documentsCtrlr.checklist.splice(0, documentsCtrlr.checklist.length);
		documentsCtrlr.getData(documentsCtrlr.currentPage);
	};

	documentsCtrlr.getData = function(index) {
		documentsCtrlr.currentPage = index;
		$rootScope.activityInProgress = true;
		var documentsURL = constant.apiURL + '/admin/documents/' + documentsCtrlr.pageSize + '/' + (documentsCtrlr.currentPage - 1);
		var user_info = storageService.get('user_info');
		restService.request(documentsURL, 'GET', null, user_info.access_token).then(function(response) {
			$rootScope.activityInProgress = false;
			documentsCtrlr.documents = [];
			documentsCtrlr.totalRecords = 0;
			if((response.status == 200) && (response.data.response_status)) {
				documentsCtrlr.documents = response.data.response_data.documents;
				documentsCtrlr.totalRecords = response.data.response_data.count;
			}
		}).catch(function(response) {
			$rootScope.activityInProgress = false;
			if(response.status == 401) {
				accessDeniedAlertService.show();
			}
		});
	};

	documentsCtrlr.refresh = function() {
		$route.reload();
	};

	documentsCtrlr.create = function() {
		$location.path('/documents/create');
	};

	documentsCtrlr.edit = function(id) {
		$location.path('/documents/edit/' + id);
	};

	documentsCtrlr.modify = function(id) {
		$location.path('/documents/modify/' + id);
		/*
		var link = document.createElement('a');
		link.href = 'http://localhost:8080/fineform-admin/#/documents/modify/' + id;
		link.target = "__blank";
		link.dispatchEvent(new MouseEvent('click'));
		*/
	};

	documentsCtrlr.reset = function reset() {
		$scope.hideMessage();
		documentsCtrlr.checklist.splice(0, documentsCtrlr.checklist.length);

		documentsCtrlr.document.id = '';
		documentsCtrlr.document.pdf = undefined;
		documentsCtrlr.document.url = '',
		documentsCtrlr.document.key = '';
		documentsCtrlr.document.name = '';
		documentsCtrlr.document.author = '';
		documentsCtrlr.document.contents = [];
		
		if ($route.current.params.id !== undefined) {
			$rootScope.activityInProgress = true;
			var documentURL = constant.apiURL + '/admin/document/' + $route.current.params.id;
			var user_info = storageService.get('user_info');
			restService.request(documentURL, 'GET', null, user_info.access_token).then(function (response) {
				$rootScope.activityInProgress = false;
				if ((response.status == 200) && (response.data.response_status)) {
					var object = response.data.response_data.document;
					documentsCtrlr.document.id = object.id;
					documentsCtrlr.document.url = object.url,
					documentsCtrlr.document.key = object.key;
					documentsCtrlr.document.name = object.name;
					documentsCtrlr.document.author = object.author;
					documentsCtrlr.document.contents = object.contents;
				}
			}).catch(function (response) {
				$rootScope.activityInProgress = false;
				if (response.status == 401) {
					accessDeniedAlertService.show();
				}
			});
		}
	};

	documentsCtrlr.save = function() {
		function validate(document) {
			var validated = true;
			if (($route.current.params.id === undefined) && (documentsCtrlr.document.pdf === undefined)) {
				validated = false;
				alert('Please select a pdf file.');
			} else if (document.key == undefined || document.key.trim() == '' || document.key.trim().length == 0) {
				validated = false;
				alert('Please enter document key');
			} else if (document.name == undefined || document.name.trim() == '' || document.name.trim().length == 0) {
				validated = false;
				alert('Please enter document name');
			} else if (document.author == undefined || document.author.trim() == '' || document.author.trim().length == 0) {
				validated = false;
				alert('Please enter document author');
			}

			return validated;
		}

		function save(document) {
			if ($route.current.params.id === undefined) {
				var fd = new FormData();
				fd.append('pdf', document.pdf);
				fd.append('key', document.key.trim());
				fd.append('name', document.name.trim());
				fd.append('author', document.author.trim());
				
				$rootScope.activityInProgress = true;
				var documentsURL = constant.apiURL + '/admin/document';
				var user_info = storageService.get('user_info');
				restService.upload(documentsURL, fd, user_info.access_token).then(function (response) {
					$rootScope.activityInProgress = false;
					if (response.response_status) {
						$location.path('/document');
					} else {
						$scope.showError('Failed to create document.');
					}
				}).catch(function (response) {
					$rootScope.activityInProgress = false;
					if (response.status == 401) {
						accessDeniedAlertService.show();
					} else {
						$scope.showError('Failed to update document.');
					}
				});
			} else {
				var data = {
					key: document.key.trim(),
					name: document.name.trim(),
					author: document.author.trim(),
				};

				$rootScope.activityInProgress = true;
				var documentsURL = constant.apiURL + '/admin/document/' + $route.current.params.id;
				var user_info = storageService.get('user_info');
				restService.request(documentsURL, 'PUT', data, user_info.access_token).then(function (response) {
					$rootScope.activityInProgress = false;
					if ((response.status == 200) && (response.data.response_status)) {
						$location.path('/document');
					} else {
						$scope.showError('Failed to update document.');
					}
				}).catch(function (response) {
					$rootScope.activityInProgress = false;
					if (response.status == 401) {
						accessDeniedAlertService.show();
					} else {
						$scope.showError('Failed to update document.');
					}
				});
			}
		}
		
		if (validate(documentsCtrlr.document)) {
			save(documentsCtrlr.document);
		}
	};

	documentsCtrlr.delete = function(id) {
		if ($window.confirm("Are you sure, you want to delete this ?")) {
			$rootScope.activityInProgress = true;
			var documentsURL = constant.apiURL + '/admin/document/' + id;
			var user_info = storageService.get('user_info');
			restService.request(documentsURL, 'DELETE', null, user_info.access_token).then(function(response) {
				$rootScope.activityInProgress = false;
				if((response.status == 200) && (response.data.response_status)) {
					$scope.showSuccess('Document deleted successfully.');
					documentsCtrlr.getData(1);
				} else {
					$scope.showError('Failed to delete document.');
				}
			}).catch(function(response) {
				$rootScope.activityInProgress = false;
				if(response.status == 401) {
					accessDeniedAlertService.show();
				} else {
					$scope.showError('Failed to delete document.');
				}
			});
		}
	};

	documentsCtrlr.checklistStatus = function(value) {
		if (value === 0) {
			if (documentsCtrlr.documents.length > 0) {
				return documentsCtrlr.documents.every(function (currentValue, index, arr) { return (documentsCtrlr.checklist.indexOf(arr[index].id) > -1); });
			}

			return false;
		}

		var index = documentsCtrlr.checklist.indexOf(value);
		return (index > -1);
	};

	documentsCtrlr.onChecklistStatusChange = function(event, value) {
		var checkbox = event.target;
		if (value === 0) {
			for (index in documentsCtrlr.documents) {
				updateChecklistStatus(checkbox.checked, documentsCtrlr.documents[index].id);
			}
		} else {
			updateChecklistStatus(checkbox.checked, value);
		}

		function updateChecklistStatus(checked, value) {
			var index = documentsCtrlr.checklist.indexOf(value);
			if (checked) {
				if (index === -1) {
					documentsCtrlr.checklist.push(value);
				}
			} else {
				documentsCtrlr.checklist.splice(index, 1);
			}
		}
	};

	documentsCtrlr.deleteSelected = function() {
		if (documentsCtrlr.checklist.length === 0) {
			alert('Please select one item to delete.');
		} else if ($window.confirm("Are you sure, you want to delete these ?")) {
			$rootScope.activityInProgress = true;
			var documentsURL = constant.apiURL + '/admin/documents/delete';
			var user_info = storageService.get('user_info');
			restService.request(documentsURL, 'POST', documentsCtrlr.checklist, user_info.access_token).then(function(response) {
				$rootScope.activityInProgress = false;
				if((response.status == 200) && (response.data.response_status)) {
					$scope.showSuccess('Document deleted successfully.');
					documentsCtrlr.getData(1);
				} else {
					$scope.showError('Failed to delete documents.');
				}
			}).catch(function(response) {
				$rootScope.activityInProgress = false;
				if(response.status == 401) {
					accessDeniedAlertService.show();
				} else {
					$scope.showError('Failed to delete documents.');
				}
			});
		}
	};

	documentsCtrlr.cancel = function() {
		documentsCtrlr.reset();
		$location.path('/documents');
	};

	documentsCtrlr.setPageSize = function(size) {
		documentsCtrlr.pageSize = size;
		documentsCtrlr.getData(1);
	};

	documentsCtrlr.currentPageSize = function(size) {
		return (documentsCtrlr.pageSize === size) ? 'active' : '';
	};
}]);
