angular.module('croppieWrapper', []).
component('croppie', {
    bindings: {
        ngModel: '=',
        src: '<',
        options: '<'
    },
    controller: function ($scope, $timeout, $element) {
        var ctrl = this;

        var c = new Croppie($element[0], {
            viewport: {
                width: 200,
                height: 200
            },
            update: function () {
                c.result('canvas').then(function(img) {
                    $scope.$apply(function () {
                        ctrl.ngModel = img;
                    });
                });
            }
        });

        ctrl.$onChanges = function (changesObj) {
            var options = changesObj.options && changesObj.options.currentValue;
            var src = changesObj.src && changesObj.src.currentValue;
            if (src && !options) {
                // bind an image to croppie
                c.bind({
                    url: src
                });
            }
            if (src && options) {
                c.destroy();
                c = new Croppie($element[0], {
                    enableZoom: options.enableZoom,
                    url: src,
                    viewport: (options.viewport && options.viewport !== {}) ? options.viewport : {width: 200, height: 200},
                    boundary: (options.boundary && options.boundary !== {}) ? options.boundary : {},
                    update: function () {
                        c.result({type: options.type ? options.type : 'canvas', format: 'png', quality: options.quality ? options.quality : 1, size: options.size ? options.size : 'viewport'}).then(function(img) {
                            $scope.$apply(function () {
                                ctrl.ngModel = img;
                            });
                        });
                    }
                });
            }
        };
    }
});