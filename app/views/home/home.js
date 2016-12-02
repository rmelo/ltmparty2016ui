'use strict';

angular.module('app.homeView', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'views/home/home.html',
            controller: 'homeController',
            resolve: {
                auth: ["$q", "authService", function ($q, authService) {
                    var user = authService.getUser();
                    if (user) {
                        return $q.when(user);
                    } else {
                        return $q.reject({ authenticated: false });
                    }
                }]
            }
        });
    }])
    .controller('homeController', ['$scope', 'authService', function ($scope, authService) {

        $scope.vm  = {};
        $scope.vm.user = authService.getUser();
        $scope.vm.wins = function(){
            return $scope.vm.user.award;
        };
        
        var key = $scope.vm.user.email.split('.').join('_');

        firebase.database().ref('entrants/' + key).on('value', function (snapshot) {
            var entrant = snapshot.val();
            entrant.photoURL = $scope.vm.user.photoURL;
            authService.signIn(entrant);
            $scope.vm.user = entrant;
            $scope.$apply();
            console.log($scope.vm.user);
        });

        $scope.logout = function () {
            firebase.auth().signOut().then(function () {
                authService.logout();
                location.reload();
            }, function (error) {
                // An error happened.
            });
        };

    }]);