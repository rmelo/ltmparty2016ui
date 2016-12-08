var url = 'https://ltmparty2016.azurewebsites.net/api/signupfunction?code=H67VKmtVXezjReqb6JKp28XVRvabhdrcCuvWhmz8h/aPmwlbEISH7A==';
angular
    .module('app')
    .service('firebaseService', function ($http) {
        this.addEntrant = function (entrant) {
            return  firebase.database().ref('entrants/' + entrant.key).set(entrant);
        };
    });