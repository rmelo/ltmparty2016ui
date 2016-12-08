'use strict';

angular.module('app.loginView', ['ngRoute', 'ngMaterial'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'views/login/login.html',
            controller: 'loginController',
            resolve: {
                auth: ["$q", "authService", function ($q, authService) {
                    var user = authService.getUser();
                    if (!user) {
                        return $q.when(user);
                    } else {
                        return $q.reject({ authenticated: true });
                    }
                }]
            }
        });
    }])
    .controller('loginController', ['$scope', '$location', 'authService', function ($scope, $location, authService) {

        $scope.vm = {};
        $scope.vm.loading = false;

        $scope.login = function (entrant) {
            authService.signIn(entrant);
            $scope.vm.loading = false;
            window.location.reload();
        };

        $scope.error = function (message) {
            $scope.vm.lastError = message;
        }

        $scope.initAction = function () {
            $scope.error(undefined);
            $scope.vm.loading = true;
        }

        $scope.endAction = function () {
            $scope.vm.loading = false;
            $scope.$apply();
        }

        $scope.addEntrant = function (entrant) {
            var key = entrant.email.split('.').join('_');
            firebase.database().ref('entrants/' + key).once('value')
                .then(function (snapshot) {
                    var value = snapshot.val();
                    if (value) {
                        $scope.login(value);
                    } else {
                        firebase.database().ref('entrants/' + key).set(entrant)
                            .then(function () {
                                $scope.login(entrant)
                                $scope.endAction();
                            }, function (error) {
                                $scope.error(error.message);
                                $scope.endAction();
                            });
                    }
                }).catch(function (error) {
                    $scope.error(error.message);
                    $scope.endAction();
                });
        }

        $scope.openFacebookLogin = function () {

            var provider = new firebase.auth.FacebookAuthProvider();
            provider.addScope('email');

            $scope.initAction();

            firebase.auth().signInWithPopup(provider).then(function (result) {

                var user = result.user;
                var entrant = { name: user.displayName, email: user.email, code: 'ABC123', photoURL: user.photoURL };
                $scope.addEntrant(entrant);

            }).catch(function (error) {
                $scope.error(error.message);
                $scope.endAction();
            });
        }

        $scope.loginEmail = function () {

            $scope.initAction();

            if ($scope.vm.login && $scope.vm.login.email && $scope.vm.login.code) {
                var email = $scope.vm.login.email;
                var code = $scope.vm.login.code;
                firebase.auth().signInWithEmailAndPassword(email, code)
                    .then(function (user) {
                        var entrant = { name: user.displayName, email: user.email, code: code, photoURL: user.photoURL };
                        $scope.addEntrant(entrant);
                    })
                    .catch(function (error) {
                        if (error.code == 'auth/wrong-password' || error.code == 'auth/user-not-found') {
                            $scope.error('E-mail ou código inválido, por favor tente novamente!');
                        } else if (error.code == 'auth/invalid-email') {
                            $scope.error('E-mail inválido!');
                        } else {
                            $scope.error(error.message);
                        }
                        $scope.endAction();
                    });
            } else {
                $scope.error('Informe o e-mail e seu código para entrar.');
                $scope.endAction();
            }
        };

    }]).config(function ($mdThemingProvider) {

        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('yellow')
            .dark();

    });