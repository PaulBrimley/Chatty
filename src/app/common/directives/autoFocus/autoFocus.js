app.directive('focusElement', function($timeout) {
    return {
        scope: { trigger: '@focusElement' },
        link: function(scope, element) {
            scope.$watch('trigger', function(newVal) {
                if (newVal) {
                    $timeout(function() {
                        element[0].focus();
                    }, 10);
                }
            });
        }
    };
});