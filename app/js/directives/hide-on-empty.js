// 'use strict';

formsAngular

.directive('hideOnEmpty', function() {
	return {
		
		replace: false,

		link: function (scope, element, attrs) {

			if (scope.$eval(attrs.ngModel) === undefined) {

				element.hide();

			}

		}

	};
})
