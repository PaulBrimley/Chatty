app.factory('userSvc', ['$http', 'APIURL', function($http, APIURL) {

    return {
        user: {
            Roles: ['User']
        },
        login: function(user) {
            return $http({
                method: 'POST',
                url: APIURL.baseUrl + '/auth/login',
                data: user
            }).then(function(response) {
                return true;
            }).catch(function (msg) {
                console.log('error logging in: ', msg);
                return false;
            });
        },
        signup: function(user) {
            return $http({
                method: 'POST',
                url: APIURL.baseUrl + '/auth/addAccount',
                data: user
            }).then(function (response) {
                return true;
            }).catch(function (msg) {
                console.log('error signing up: ', msg);
                return false;
            });
        }
    };
}]);