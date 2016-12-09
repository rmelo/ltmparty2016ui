'use strict';

angular.module('app.stageView', ['ngRoute', 'ngMaterial'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/stage', {
            templateUrl: 'views/stage/stage.html',
            controller: 'stageController',
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
    .controller('stageController', ['$scope', '$location', '$rootScope', 'authService', function ($scope, $location, $rootScope, authService) {

        $scope.init = function () {
            $scope.vm = {};
            $scope.vm.entrants = [];
            $scope.vm.reward = null;
            $scope.vm.loading = false;
        };

        $scope.startAction = function () {
            $scope.loading = true;
        };

        $scope.completeAction = function () {
            $scope.loading = false;
        };

        $scope.remaining = function () {
            if ($scope.vm.reward)
                return $scope.vm.reward.qtd - $scope.vm.reward.winners.length;
            return 0;
        }

        $scope.showRaffleButton = function () {
            return $scope.vm.entrants.length > 0
                && $scope.vm.reward
                && !$scope.vm.reward.finished
                && $scope.vm.reward.qtd > $scope.vm.reward.winners.length
                && !$scope.loading;
        };

        $scope.showFinalizeButton = function () {
            return $scope.vm.reward
                && !$scope.vm.reward.finished
                && $scope.vm.reward.qtd == $scope.vm.reward.winners.length;
        };

        $scope.logout = function () {
            firebase.auth().signOut().then(function () {
                authService.logout();
                location.reload();
            }, function (error) {
                // An error happened.
            });
        };

        $scope.loadEntrants = function () {
            firebase.database().ref('entrants').once('value')
                .then(function (snapshot) {

                    var entrants = snapshot.val();
                    snapshot.forEach(function (childSnapshot) {
                        var childData = childSnapshot.val();
                        if (!childData.award)
                            $scope.vm.entrants.push(childData);
                    });

                    $scope.getRewards();

                });
        };

        $scope.getRewards = function () {
            firebase.database().ref('rewards').once('value')
                .then(function (snapshot) {

                    var rewards = [];
                    var rewardsData = snapshot.val();

                    rewardsData.forEach(function (rewardData) {

                        var winners = [];
                        if (rewardData.winners) {
                            rewardData.winners.forEach(function (winner) {
                                winners.push(winner);
                            });
                        }

                        rewardData.winners = winners;
                        if (!rewardData.finished) {
                            rewardData.winners = winners;
                            rewardData.lastItem = winners.length == rewardData.qtd - 1;
                            rewards.push(rewardData);
                        }

                    });

                    var current = _.chain(rewards).sortBy('position').first().value();
                    if (current) {
                        $scope.vm.reward = current;
                        $scope.$apply();
                    } else {
                        $rootScope.$apply(function () {
                            $location.path("/winners");
                            console.log($location.path());
                        });
                    }
                });
        };

        $scope.raffle = function () {

            if ($scope.vm.entrants.length > 0 && $scope.vm.reward.qtd > $scope.vm.reward.winners.length) {

                $scope.startAction();

                var reward = $scope.vm.reward;

                var position = _.random(0, $scope.vm.entrants.length - 1);
                var winner = $scope.vm.entrants[position];
                winner.award = { name: reward.name, position: position };

                if (!reward.winners)
                    reward.winners = [];
                reward.winner = { position: reward.winners.length + 1, name: (winner.name ? winner.name : winner.email), email: winner.email };

                var updates = {};
                updates['rewards/' + reward.id + '/winners/' + reward.winner.position] = reward.winner;
                updates['entrants/' + winner.email.split('.').join('_')] = winner;

                firebase.database().ref().update(updates)
                    .then(function () {
                        $scope.completeAction();
                        $scope.init();
                        $scope.loadEntrants();
                    })
                    .catch(function (error) {
                        console.log(error);
                        $scope.completeAction();
                    });

            };
        };

        $scope.finalize = function () {
            if ($scope.vm.reward.winners.length == $scope.vm.reward.qtd) {
                $scope.startAction();
                firebase.database().ref('rewards/' + $scope.vm.reward.id).child('finished').set(true)
                    .then(function () {
                        $scope.init();
                        $scope.loadEntrants();
                        $scope.completeAction();
                    })
                    .catch(function (error) {
                        console.log(error);
                        $scope.completeAction();
                    });
            }
        };


        $scope.remove = function (position, email) {
            
            $scope.startAction();

            var updates = {};

            var winners = {}
            var newWinners = _.reject($scope.vm.reward.winners, { position: position });
            _.each(newWinners, function (winner, index) {
                delete winner.$$hashKey;
                winner.position = index + 1
                winners[winner.position] = winner;
            });

            $scope.vm.reward.winners = newWinners;

            updates['rewards/' + $scope.vm.reward.id + '/winners'] = winners;
            updates['entrants/' + email.split('.').join('_') + '/award'] = null;

            firebase.database().ref().update(updates)
                .then(function () {
                    $scope.init();
                    $scope.loadEntrants();
                    $scope.completeAction();
                })
                .catch(function (error) {
                    console.log(error);
                    $scope.completeAction();
                });;
        };

        $scope.init();
        $scope.loadEntrants();

    }])
    .config(function ($mdThemingProvider) {

        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('blue')
            .dark();

    });