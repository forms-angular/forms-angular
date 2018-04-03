/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />
var fng;
(function (fng) {
    var directives;
    (function (directives) {
        /*@ngInject*/
        function fngLink(routingService, SubmissionsService) {
            return {
                restrict: 'E',
                scope: { dataSrc: '&model' },
                link: function (scope, element, attrs) {
                    var ref = attrs['ref'];
                    var form = attrs['form'];
                    scope['readonly'] = attrs['readonly'];
                    form = form ? form + '/' : '';
                    if (attrs['text'] && attrs['text'].length > 0) {
                        scope['text'] = attrs['text'];
                    }
                    var index = scope['$parent']['$index'];
                    scope.$watch('dataSrc()', function (newVal) {
                        if (newVal) {
                            if (typeof index !== 'undefined' && angular.isArray(newVal)) {
                                newVal = newVal[index];
                            }
                            scope['link'] = routingService.buildUrl(ref + '/' + form + newVal + '/edit');
                            if (!scope['text']) {
                                SubmissionsService.getListAttributes(ref, newVal).then(function (response) {
                                    var data = response.data;
                                    if (data.success === false) {
                                        scope['text'] = data.err;
                                    }
                                    else {
                                        scope['text'] = data.list;
                                    }
                                }, function (response) {
                                    scope['text'] = 'Error ' + response.status + ': ' + response.data;
                                });
                            }
                        }
                    }, true);
                },
                template: function (element, attrs) {
                    return attrs.readonly ? '<span class="fng-link">{{text}}</span>' : '<a href="{{ link }}" class="fng-link">{{text}}</a>';
                }
            };
        }
        directives.fngLink = fngLink;
    })(directives = fng.directives || (fng.directives = {}));
})(fng || (fng = {}));
//# sourceMappingURL=fng-link.js.map