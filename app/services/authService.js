angular.module('app').factory('authService', function() {
    return {
        getUser: function() {
            var user = localStorage['user'];
            return user ? JSON.parse(user) : null;
        },
        signIn: function(user) {
            user.isAdmin = user.email == 'admin@grupoltm.com.br';
            localStorage.setItem('user', JSON.stringify(user));
        },
        logout: function() {
            localStorage.removeItem('user');
        }
    };
});
