'use strict';

angular.module('app.loginView', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'views/login/login.html',
            controller: 'loginController',
            resolve: {
                auth: ["$q", "authService", function($q, authService) {
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
    .controller('loginController', ['$scope', '$location', 'apiService', 'authService', function($scope, $location, apiService, authService) {

        $scope.vm = {};
        $scope.vm.loading = false;

        var provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('email');

        $scope.openFacebookLogin = function() {

            $scope.vm.loading = true;

            firebase.auth().signInWithPopup(provider).then(function(result) {

                var user = result.user;
                var entrant = { name: user.displayName, email: user.email };

                apiService.addEntrant(entrant)
                    .then(function(result) {
                        entrant = { name: user.displayName, email: user.email, photoURL: user.photoURL, code: result.data.code };
                        entrant.award = result.data.award ? result.data.award : undefined;
                        authService.signIn(entrant);
                        $location.path('home');
                        $scope.vm.loading = false;
                    }, function(error) {
                        console.log('Error', error.data, 'Status', error.status);
                        $scope.vm.loading = false;
                    });

            }).catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                var email = error.email;
                var credential = error.credential;
                console.error(error);
                $scope.vm.loading = false;
            });
        }

    }]);