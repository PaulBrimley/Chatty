var app = angular.module('chatty', [
    'croppieWrapper',
    'LocalStorageModule',
    'ngAnimate',
    'ngImgCrop',
    'templates',
    'toaster',
    'ui.bootstrap',
    'ui.mask',
    'ui.router'
]);


app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider', 'localStorageServiceProvider', function($httpProvider, $stateProvider, $urlRouterProvider, localStorageServiceProvider) {

    $stateProvider
        .state('login', {
            url: '/login?token?userId',
            templateUrl: 'common/states/login/login.html',
            controller: 'loginCtrl'
        })
        .state('main', {
            url: '/main',
            templateUrl: 'common/states/mainArea/mainArea.html',
            controller: 'mainAreaCtrl'
        });

    localStorageServiceProvider.setPrefix('chatty').setStorageCookieDomain(window.location).setNotify(true, true);
    $urlRouterProvider.otherwise('/login');
}]);