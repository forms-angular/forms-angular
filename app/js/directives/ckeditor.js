formsAngular.directive('ckeditor', function() {
    return {
        require: '?ngModel',
        link: function(scope, elm, attr, ngModel) {
            var options={disableNativeSpellChecker : false};
            options = angular.extend(options, scope[attr.ckeditor]);
            var ck = CKEDITOR.replace(elm[0], options);

            if (!ngModel) return;

            ck.on('instanceReady', function() {
                ck.setData(ngModel.$viewValue);
            });

            function updateModel() {
                scope.$apply(function() {
                    var value = ck.getData();
                    if ((ngModel.$viewValue || '') !== value) {
                        ngModel.$setViewValue(value);
                    }
                });
            }

            ck.on('change', updateModel);
            ck.on('key', updateModel);
            ck.on('dataReady', updateModel);

            ngModel.$render = function(value) {
                ck.setData(ngModel.$viewValue);
            };
        }
    };
});
