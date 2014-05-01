'use strict';

var demo = angular.module('myDemoApp');


demo.directive( 'affix',
[
    '$compile', '$location'
,
function($compile, $location) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'demo/template/affix.html',
        compile: function() {
            var body = $('body');
            var affixes = [];
            return {
                post: function(scope, element) {
                    scope.affixes = affixes;
                    $('.affix-section', body).find('section').each(function() {
                        var section = $(this);
                        affixes.push({
                            id : section.attr('id'),
                            name : section.attr('name')
                        });
                        $compile(element)(scope);
                    });

                }
            };
        }
    };
}]);


demo.directive( 'affixScroll',
[
    '$window'
,
function ($window) {
    return {
        link: function (scope, element) {
            var offset;
            var buffer = 80;
            var top = element.offset().top - buffer;
            var bottom = top + element.height() - buffer;

            // scroll spy functionality
            angular.element($window).on('scroll.affix-scroll', function () {
                var id = element.attr('id');
                if (angular.isDefined($window.pageYOffset)) {
                    offset = $window.pageYOffset;
                } else {
                    var iebody = (document.compatMode && document.compatMode !== "BackCompat") ? document.documentElement : document.body;
                    offset = iebody.scrollTop;
                }

                var modal = $('li#'+id+'Opt');
                if (top < offset && offset < bottom) {
                    if (!modal.hasClass('active')) {
                        modal.addClass('active');
                    }
                } else {
                    if (modal.hasClass('active')) {
                        modal.removeClass('active');
                    }
                }
            });
        }
    };
}]);


demo.directive( 'uiScrollfix',
[
    '$window'
,
function ($window) {
    'use strict';
    return {
        require: '^?uiScrollfixTarget',
        link: function (scope, elm, attrs, uiScrollfixTarget) {
            var top = elm[0].offsetTop,
                $target = uiScrollfixTarget && uiScrollfixTarget.$element || angular.element($window);

            if (!attrs.uiScrollfix) {
                attrs.uiScrollfix = top;
            } else if (typeof(attrs.uiScrollfix) === 'string') {
                // charAt is generally faster than indexOf: http://jsperf.com/indexof-vs-charat
                if (attrs.uiScrollfix.charAt(0) === '-') {
                    attrs.uiScrollfix = top - parseFloat(attrs.uiScrollfix.substr(1));
                } else if (attrs.uiScrollfix.charAt(0) === '+') {
                    attrs.uiScrollfix = top + parseFloat(attrs.uiScrollfix.substr(1));
                }
            }

            function onScroll() {
                // if pageYOffset is defined use it, otherwise use other crap for IE
                var offset;
                if (angular.isDefined($window.pageYOffset)) {
                    offset = $window.pageYOffset;
                } else {
                    var iebody = (document.compatMode && document.compatMode !== "BackCompat") ? document.documentElement : document.body;
                    offset = iebody.scrollTop;
                }
                if (!elm.hasClass('ui-scrollfix') && offset > attrs.uiScrollfix) {
                    elm.addClass('ui-scrollfix');
                } else if (elm.hasClass('ui-scrollfix') && offset < attrs.uiScrollfix) {
                    elm.removeClass('ui-scrollfix');
                }
            }

            $target.on('scroll', onScroll);

            // Unbind scroll event handler when directive is removed
            scope.$on('$destroy', function() {
                $target.off('scroll', onScroll);
            });
        }
    };
}]);


demo.directive( 'uiScrollfixTarget',
[
function () {
    'use strict';
    return {
        controller: function($element) {
            this.$element = $element;
        }
    };
}]);










