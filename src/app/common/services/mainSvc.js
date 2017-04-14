app.factory('mainSvc', ['$http', function($http) {

    return {
        application: {
            allowedViews: [],
            buildNavsViews: function (roles) {
                var navHolder = [];
                var allowedViewsHolder = [];
                var storableViewsHolder = [];
                for (var view in this.obj) {
                    this.obj[view].active = (this.roleViews.User.indexOf(view) !== -1) && this.obj[view].enabled;
                }
                for (var i = 0; i < roles.length; i++) {
                    for (var j = 0; j < this.roleViews[roles[i]].length; j++) {
                        if (this.obj[this.roleViews[roles[i]][j]].enabled) this.obj[this.roleViews[roles[i]][j]].active = true;
                    }
                }
                for (var prop in this.obj) {
                    if (this.obj[prop].active && (this.obj[prop].types.indexOf('NAV') !== -1)) navHolder.push(this.obj[prop]);
                    if (this.obj[prop].active && (this.obj[prop].types.indexOf('STATE') !== -1)) allowedViewsHolder.push(this.obj[prop].state);
                    if (this.obj[prop].active && (this.obj[prop].types.indexOf('STATE') !== -1) && this.obj[prop].storable) storableViewsHolder.push(this.obj[prop].state);
                }
                this.navs = navHolder;
                this.allowedViews = allowedViewsHolder;
                this.storableViews = storableViewsHolder;
            },
            currentView: 'main.user.messages',
            navs: [],
            obj: {
                adminDashboard: {
                    active: false,
                    enabled: false,
                    key: 'adminDashboard',
                    order: 1,
                    state: 'main.admin.dashboard',
                    storable: true,
                    title: '',
                    types: ['NAV', 'STATE']
                },
                logout: {
                    active: true,
                    enabled: true,
                    key: 'logout',
                    order: 100,
                    state: 'login',
                    storable: false,
                    title: '',
                    types: ['NAV', 'STATE']
                },
                messages: {
                    active: true,
                    enabled: true,
                    key: 'messages',
                    order: 2,
                    state: 'main.user.messages',
                    storable: false,
                    title: '',
                    types: ['NAV', 'STATE']
                },
                profile: {
                    active: true,
                    enabled: true,
                    key: 'profile',
                    order: 3,
                    state: 'main.user.profile',
                    storable: true,
                    title: '',
                    types: ['NAV', 'STATE']
                },
                signup: {
                    active: true,
                    enabled: true,
                    key: 'signup',
                    order: 100,
                    state: 'signup',
                    storable: false,
                    title: 'Signup',
                    types: ['STATE']
                }
            },
            previousView: '',
            roleViews: {
                Admin: [
                    'adminDashboard'
                ],
                User: [
                    'profile',
                    'logout',
                    'messages',
                    'signup'
                ]
            },
            storableViews: []
        }
    };
}]);