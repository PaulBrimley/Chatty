app.controller('mainCtrl', ['$rootScope', '$scope', '$state', 'mainSvc', 'userSvc', function($rootScope, $scope, $state, mainSvc, userSvc) {

    mainSvc.application.buildNavsViews(userSvc.user.Roles);

    $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from) {
        mainSvc.application.previousView = from.name;
        if (to.name && to.name !== '' && (mainSvc.application.allowedViews.indexOf(to.name) === -1) && mainSvc.application.previousView !== '') {
            $state.go(mainSvc.application.previousView);
        }
        if ((mainSvc.application.allowedViews.indexOf(to.name) !== -1) && (mainSvc.application.storableViews.indexOf(to.name) !== -1) && userSvc.user.Token) {
            if (localStorageService.isSupported) {
                localStorageService.set('divveeCurrentView' + userSvc.user.Inf_Id, to.name);
            }
            mainSvc.application.currentView = to.name;
        }
    });
}]);