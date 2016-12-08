'use strict';

angular.module('app.winsView', ['ngRoute', 'ngMaterial'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/wins', {
            templateUrl: 'views/wins/wins.html',
            controller: 'winsController'
        });
    }])
    .controller('winsController', ['$scope', '$location', function ($scope, $location) {}]);