app.directive('background', [function() {
    return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            properties: '=',
            animateBackground: '='
        },
        link: function(scope, elem, attrs) {

            scope.$watch('properties', function(newVal) {
                elem.css('background-image', 'none');
                if (newVal.file) {
                    elem.css({
                        'opacity': newVal.opacity ? newVal.opacity : 1,
                        'background-image': 'url(' + newVal.file + ')',
                        'background-position': 'center',
                        'background-size': 'cover',
                        'background-repeat': 'no-repeat'
                    });
                }
                scope.animateBackground = newVal.animate;
            });
        }
    };
}]);