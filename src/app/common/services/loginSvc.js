app.factory('loginSvc', ['$http', 'APIURL', function($http, APIURL) {

    return {
        login: function(user) {
            return $http({
                method: 'POST',
                url: APIURL.baseUrl + '/auth/login',
                data: user
            }).then(function(response) {
                console.log(response);
                return true;
            }).catch(function (msg) {
                console.log('error logging in: ', msg);
                return false;
            });
        }
    };
}]);