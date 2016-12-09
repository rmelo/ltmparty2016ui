'use strict';

angular.module('app.winnersView', ['ngRoute', 'ngMaterial'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/winners', {
            templateUrl: 'views/winners/winners.html',
            controller: 'winnersController',
            resolve: {
                auth: ["$q", "authService", function($q, authService) {
                    var user = authService.getUser();
                    if (user) {
                        if (!user.finished)
                            return $q.reject({ notFinished: true });
                        return $q.when(user);
                    } else {
                        return $q.reject({ authenticated: false });
                    }
                }]
            }
        });
    }])
    .controller('winnersController', ['$scope', '$location', 'authService', function($scope, $location, authService) {

        $scope.init = function() {
            $scope.vm = {};
            $scope.vm.rewards = null;
            $scope.user = authService.getUser();
        };

        $scope.loadWinners = function() {
            firebase.database().ref('rewards').once('value')
                .then(function(snapshot) {

                    var rewards = [];
                    var rewardsData = snapshot.val();

                    rewardsData.forEach(function(rewardData) {

                        var winners = [];
                        if (rewardData.winners) {
                            rewardData.winners.forEach(function(winner) {
                                winners.push(winner);
                            });
                        }

                        rewardData.winners = winners;
                        rewards.push(rewardData);
                    });

                    $scope.vm.rewards = rewards;
                    $scope.$apply();
                });
        }



        $scope.init();
        $scope.loadWinners();
    }]);