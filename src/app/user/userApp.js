var user = angular.module('chattyUser', ['ui.router']);

user.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('main.user', {
            url: '/user',
            template: '<div data-ui-view></div>'
        })
        .state('main.user.messages', {
            url: '/messages',
            templateUrl: 'user/states/messages/messages.html',
            controller: 'messagesCtrl'
        })
        .state('main.user.profile', {
            url: '/profile',
            templateUrl: 'user/states/profile/profile.html',
            controller: 'profileCtrl'
        });
}]);