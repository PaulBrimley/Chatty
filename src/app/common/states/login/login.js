app.controller('loginCtrl', ['$scope', '$state', 'loginSvc', 'toaster', function($scope, $state, loginSvc, toaster) {

    $scope.loading = false;
    $scope.user = {};

    $scope.login = function(loginForm) {
        console.log('logging in', $scope.user);
        if ($scope.loading) return false;
        $scope.loading = true;
        loginForm.$submitted = true;
        if (loginForm.$invalid) {
            toaster.pop('error', 'Error', 'Please fill out all of the form fields.');
            $scope.loading = false;
            return false;
        }

        loginSvc.login($scope.user).then(function(response) {
            if (response) {
                toaster.pop('success', 'Success!', 'You have successfully logged in.');
            } else {
                toaster.pop('error', 'Error', 'Something went wrong. Please try again later.');
            }
        });
    };

    $scope.signup = function() {
        $state.go('signup');
    };
}]);