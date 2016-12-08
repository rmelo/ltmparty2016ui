'use strict';

angular.module('app.stageView', ['ngRoute', 'ngMaterial'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/stage', {
            templateUrl: 'views/stage/stage.html',
            controller: 'stageController'
        });
    }])
    .controller('stageController', ['$scope', '$location', function($scope, $location) {

        $scope.init = function() {
            $scope.vm = {};
            $scope.vm.entrants = [];
            $scope.vm.reward = null;
        };

        $scope.showRaffleButton = function() {
            return $scope.vm.entrants.length > 0
                && $scope.vm.reward
                && !$scope.vm.reward.finished
                && $scope.vm.reward.qtd > $scope.vm.reward.winners.length;
        };

        $scope.showFinalizeButton = function() {
            return $scope.vm.reward
                && !$scope.vm.reward.finished
                && $scope.vm.reward.qtd == $scope.vm.reward.winners.length;
        };

        $scope.loadEntrants = function() {
            firebase.database().ref('entrants').once('value')
                .then(function(snapshot) {

                    var entrants = snapshot.val();
                    snapshot.forEach(function(childSnapshot) {
                        var childData = childSnapshot.val();
                        if (!childData.award)
                            $scope.vm.entrants.push(childData);
                    });

                    $scope.getRewards();

                });
        };

        $scope.getRewards = function() {
            firebase.database().ref('rewards').once('value')
                .then(function(snapshot) {

                    var rewards = [];
                    var rewardsData = snapshot.val();

                    debugger;

                    rewardsData.forEach(function(rewardData) {

                        var winners = [];
                        if (rewardData.winners) {
                            rewardData.winners.forEach(function(winner) {
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
                    }else{
                        window.alert('Acabou!');
                    }
                });
        };

        $scope.raffle = function() {

            if ($scope.vm.entrants.length > 0 && $scope.vm.reward.qtd > $scope.vm.reward.winners.length) {

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
                    .then(function() {
                        $scope.init();
                        $scope.loadEntrants();
                    })
                    .catch(function(error) {
                        console.log(error);
                    });

            };
        };

        $scope.finalize = function() {
            if ($scope.vm.reward.winners.length == $scope.vm.reward.qtd) {
                firebase.database().ref('rewards/' + $scope.vm.reward.id).child('finished').set(true)
                    .then(function() {
                        $scope.init();
                        $scope.loadEntrants();
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            }
        };

        $scope.init();
        $scope.loadEntrants();

    }]);