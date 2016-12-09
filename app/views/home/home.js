'use strict';

angular.module('app.homeView', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'views/home/home.html',
            controller: 'homeController',
            resolve: {
                auth: ["$q", "authService", function($q, authService) {
                    var user = authService.getUser();
                    if (user) {
                        if (user.isAdmin)
                            return $q.reject({ admin: true });
                        if (user.finished)
                            return $q.reject({ finished: true });
                        return $q.when(user);
                    } else {
                        return $q.reject({ authenticated: false });
                    }
                }]
            }
        });
    }])
    .controller('homeController', ['$scope', 'authService', function($scope, authService) {

        $scope.vm = {};
        $scope.vm.user = authService.getUser();
        $scope.vm.wins = function() {
            return $scope.vm.user.award;
        };

        var key = $scope.vm.user.email.split('.').join('_');

        firebase.database().ref('entrants/' + key).on('value', function(snapshot) {
            var entrant = snapshot.val();
            authService.signIn(entrant);
            $scope.vm.user = entrant;
            $scope.$apply();
        });

    }]);