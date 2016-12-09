'use strict';

angular.module('app.rewardView', ['ngRoute', 'ngMaterial'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/reward', {
            templateUrl: 'views/reward/reward.html',
            controller: 'rewardController',
            resolve: {
                auth: ["$q", "authService", function ($q, authService) {
                    var user = authService.getUser();
                    if (user) {
                        if (!user.isAdmin)
                            return $q.reject({ notAdmin: true });
                        return $q.when(user);
                    } else {
                        return $q.reject({ authenticated: false });
                    }
                }]
            }
        });
    }])
    .controller('rewardController', ['$scope', '$location', '$rootScope', 'authService', function ($scope, $location, $rootScope, authService) {

        $scope.vm = {};
        $scope.loading = false;

        $scope.reward = function () {

            $scope.loading = true;

            var key = $scope.vm.email.split('.').join('_').toLowerCase();
            firebase.database().ref('entrants/' + key).child('award').set({ name: $scope.vm.award })
                .then(function () {
                    $scope.loading = false;
                    $scope.vm = {};
                    $scope.$apply();
                });
        };

    }])
    .config(function ($mdThemingProvider) {

        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('blue')
            .dark();

    });