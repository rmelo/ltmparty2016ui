var url = 'https://ltmparty2016.azurewebsites.net/api/signupfunction?code=H67VKmtVXezjReqb6JKp28XVRvabhdrcCuvWhmz8h/aPmwlbEISH7A==';
angular
    .module('app')
    .service('apiService', function ($http) {
        this.addEntrant = function (entrant) {
            return $http.post(url, entrant);
        };
    });