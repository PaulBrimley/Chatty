var admin = angular.module('chattyAdmin', ['ui.router']);

admin.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('main.admin', {
            url: '/admin',
            template: '<div data-ui-view></div>'
        })
        .state('main.admin.dashboard', {
            url: '/dashboard',
            templateUrl: 'admin/states/dashboard/adminDashboard.html',
            controller: 'adminDashboardCtrl'
        });
}]);