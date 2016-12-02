'use strict';

var app = angular.module('app', [
  'ngMaterial',
  'ngRoute',
  'app.loginView',
  'app.homeView'
])

app.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  //$routeProvider.otherwise({ redirectTo: '/login' });
}])

app.factory('authService', function () {
  return {
    getUser: function () {
      var user =localStorage['user'];
      return user ? JSON.parse(user) : null;
    },
    signIn: function (user) {
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout: function(){
      localStorage.removeItem('user');
    }
  };
});

app.run(function ($rootScope, $location, authService) {

  $rootScope.$on('$routeChangeError', function (event, current, previous, eventObj) {
    if (eventObj.authenticated === false) {
      $location.path('/login');
    }else if (eventObj.authenticated === true) {
      $location.path('/home');
    }
  });

});