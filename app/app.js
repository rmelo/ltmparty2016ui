'use strict';

var app = angular.module('app', [
    'ngMaterial',
    'ngRoute',
    'app.loginView',
    'app.homeView',
    'app.stageView',
    'app.winnersView',
    'app.rewardView'
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
            if (user) {
                $location.path(user.isAdmin ? '/stage' : '/home');
            } else {
                $location.path('/home');
            }
        } else if (eventObj.admin) {
            $location.path('/stage');
        } else if (eventObj.finished) {
            $location.path('/winners');
        } else if (eventObj.notAdmin || eventObj.notFinished) {
            $location.path('/home');
        }
    });
});

app.directive('logout', ['authService', function(authService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function() {
                firebase.auth().signOut().then(function() {
                    authService.logout();
                    location.reload();
                }, function(error) {
                    // An error happened.
                });
            });
        }
    };
}]);