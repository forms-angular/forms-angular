/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.directives {

  /*@ngInject*/
  export function fngLink(routingService, SubmissionsService): angular.IDirective {
    return {
      restrict: 'E',
      scope: {dataSrc: '&model'},
      link: function (scope, element, attrs) {
        var ref: string = attrs['ref'];
        var form: string = attrs['form'];
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
                let data: any = response.data;
                if (data.success === false) {
                  scope['text'] = data.err;
                } else {
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
}
