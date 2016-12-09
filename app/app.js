'use strict';

var app = angular.module('app', [
    'ngMaterial',
    'ngRoute',
    'app.loginView',
    'app.homeView',
    'app.stageView',
    'app.winnersView',
])

app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({ redirectTo: '/login' });
}])

app.run(function($rootScope, $location, authService) {

    $rootScope.$on('$routeChangeError', function(event, current, previous, eventObj) {
        if (eventObj.authenticated === false) {
            $location.path('/login');
        } else if (eventObj.authenticated === true) {
            var user = authService.getUser();
            if(user){
                $location.path(user.code == 'ltmfestaadmin' ? '/stage' : '/home');
            }else{
                $location.path('/home');
            }
        }
    });
});