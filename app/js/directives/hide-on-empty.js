formsAngular

.directive('hideOnEmpty', function() {
    return {
        
        replace: false,

        link: function (scope, element, attrs) {

            //if its a hide group, then its not the group but the input

            if (element.hasClass('control-group')) {

                if (element.find('input').length > 0) {


                    if (scope.$eval(element.find('input').prop('attributes').getNamedItem('ng-model').value) === undefined) {

                        element.hide();

                    }

                }

                if (element.find('textarea').length > 0) {

                    if (scope.$eval(element.find('textarea').prop('attributes').getNamedItem('ng-model').value) === undefined) {

                        element.hide();

                    }

                }

                

            } else {

                if (scope.$eval(attrs.ngModel) === undefined) {

                    element.hide();

                }
            }
        }

    };
});