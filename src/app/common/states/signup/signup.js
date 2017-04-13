app.controller('signupCtrl', ['$scope', '$state', 'loginSvc', 'signupSvc', 'toaster', function($scope, $state, loginSvc, signupSvc, toaster) {

    $scope.loading = false;
    $scope.user = {
        Username: 'TimWest',
        FirstName: 'Tim',
        LastName: 'West',
        Email: 'asdf@gmail.com',
        ConfirmEmail: 'asdf@gmail.com',
        Password: 'asdf',
        ConfirmPassword: 'asdf'
    };

    $scope.cancelSignup = function() {
        $state.go('login');
    };

    $scope.signup = function(signupForm) {
        if ($scope.loading) return false;
        $scope.loading = true;
        signupForm.$submitted = true;
        if (signupForm.$invalid) {
            toaster.pop('error', 'Error', 'Please fill out all of the form fields.');
            $scope.loading = false;
            return false;
        }
        if ($scope.user.Email !== $scope.user.ConfirmEmail) {
            toaster.pop('error', 'Error', 'Your email does not match your confirm email.');
            $scope.loading = false;
            return false;
        }
        if ($scope.user.Password !== $scope.user.ConfirmPassword) {
            toaster.pop('error', 'Error', 'Your password does not match your confirm password.');
            $scope.loading = false;
            return false;
        }

        var toasterInstance = toaster.pop('warning', 'Signing up', 'We are working on signing up', 0);
        signupSvc.signup($scope.user).then(function (response) {
            toaster.clear(toasterInstance);
            if (response) {
                toaster.pop('success', 'Success!', 'You have successfully signed up.');
                loginSvc.login($scope.user).then(function(response) {

                });
            } else {
                toaster.pop('error', 'Error', 'Something went wrong. Please try again later.');
            }
        });
    };

}]);