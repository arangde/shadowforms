var app = angular.module('AngularJS', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider){
    $routeProvider.when('/', {
        templateUrl: 'login.html'
    }).when('/dashboard', {
        resolve: {
            "check": ['$location', '$rootScope', function($location, $rootScope) {
                if(!$rootScope.loggedIn) {
                    $location.path('/');
                }
            }]
        },
        templateUrl: 'dashboard.html'
    }).otherwise({
        redirectTo:'/'
    });
}]);
