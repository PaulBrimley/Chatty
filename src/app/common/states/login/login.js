app.controller('loginCtrl', ['$scope', '$state', 'mainSvc', 'toaster', 'userSvc', function($scope, $state, mainSvc, toaster, userSvc) {

    $scope.loading = false;
    $scope.user = {
        UsernameEmail: 'asdf@gmail.com',
        Password: 'asdf'
    };

    $scope.login = function(loginForm) {
        if ($scope.loading) return false;
        $scope.loading = true;
        loginForm.$submitted = true;
        if (loginForm.$invalid) {
            toaster.pop('error', 'Error', 'Please fill out all of the form fields.');
            $scope.loading = false;
            return false;
        }

        userSvc.login($scope.user).then(function(response) {
            $scope.loading = false;
            if (response) {
                toaster.pop('success', 'Success!', 'You have successfully logged in.');
                $state.go(mainSvc.application.currentView);
            } else {
                toaster.pop('error', 'Error', 'Something went wrong. Please try again later.');
            }
        });
    };

    $scope.signup = function() {
        $state.go('signup');
    };
}]);