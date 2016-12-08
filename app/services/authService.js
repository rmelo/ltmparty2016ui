angular.module('app').factory('authService', function() {
    return {
        getUser: function() {
            var user = localStorage['user'];
            return user ? JSON.parse(user) : null;
        },
        signIn: function(user) {
            localStorage.setItem('user', JSON.stringify(user));
        },
        logout: function() {
            localStorage.removeItem('user');
        }
    };
});
