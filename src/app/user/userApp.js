var user = angular.module('chattyUser', ['ui.router']);

user.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('main.user', {
            url: '/user',
            template: '<div data-ui-view></div>'
        })
        .state('main.user.chats', {
            url: '/chats',
            templateUrl: 'user/states/chats/chats.html',
            controller: 'chatsCtrl'
        })
        .state('main.user.profile', {
            url: '/profile',
            templateUrl: 'user/states/profile/profile.html',
            controller: 'profileCtrl'
        });
}]);