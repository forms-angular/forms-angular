/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.controllers {

  /*@ngInject*/
  export function LinkCtrl($scope) {

    /**
     * In the event that the link is part of a form that belongs to a (ui-bootstrap) modal,
     * close the modal
     */
    $scope.checkNotModal = function() {
      let elm = $scope.element[0];
      let parentNode;
      let finished = false;
      const fakeEvt = {
        preventDefault: angular.noop,
        stopPropagation: angular.noop,
        target:1,
        currentTarget:1
      };
      do {
        parentNode = elm.parentNode;
        if (!parentNode) {
          finished = true;
        } else if (typeof parentNode.getAttribute === "function" && parentNode.getAttribute('uib-modal-window')) {
          (angular.element(elm).scope() as any).close(fakeEvt);
          finished = true;
        } else {
          elm = parentNode;
        }
      } while (!finished);
    };
  }
}

module fng.directives {

  /*@ngInject*/
  export function fngLink(RoutingService: fng.IRoutingService, SubmissionsService: fng.ISubmissionsService): angular.IDirective {
    return {
      restrict: 'E',
      scope: {dataSrc: '&model'},
      link: function (scope, element, attrs) {
        const ref = attrs['ref'];
        const isLabel = attrs['text'] && (unescape(attrs['text']) !== attrs['text']);
        var form: string = attrs['form'];
        var linktab: string = attrs['linktab'];
        scope['readonly'] = attrs['readonly'];
        scope['element'] = element;
        form = form ? form + '/' : '';
        linktab = linktab ? '/' + linktab : '';

        if (isLabel) {
          let workScope = scope;
          let workString = '';
          while (typeof workScope['baseSchema'] !== "function" && workScope.$parent) {
            if (typeof workScope['$index'] !== "undefined") {
              throw new Error('No support for $index at this level - ' + workString);
            }
            workScope = workScope.$parent;
            workString = workString + '$parent.';
          }
          let attrib = attrs['fld'];
          var watchExpression;
          var splitAttrib = attrib.split('.');
          if ((scope.$parent as any).subDoc && ((scope.$parent as any).subDoc[attrib] || (scope.$parent as any).subDoc[splitAttrib[splitAttrib.length-1]])) {
            // Support for use in directives in arrays
            if ((scope.$parent as any).subDoc[attrib]) {
              watchExpression = workString + 'subDoc.' + attrib;
            } else {
              watchExpression = workString + 'subDoc.' + splitAttrib[splitAttrib.length-1];
            }
          } else {
            if (typeof workScope['$index'] !== "undefined") {
              attrib = splitAttrib.pop();
              attrib = splitAttrib.join('.') + '[' + workScope['$index'] + '].' + attrib;
            } else {
              attrib = '.' + attrib;
            }
            watchExpression = workString + 'record' + attrib;
          }
          scope.$watch(watchExpression, function (newVal: any) {
            if (newVal) {
              if (/^[a-f0-9]{24}/.test(newVal.toString())) {
                newVal = newVal.slice(0,24);
              }
              else if (newVal.id && /^[a-f0-9]{24}/.test(newVal.id)) {
                newVal = newVal.id.slice(0,24);
              }
              else if (scope.$parent["f_" + attrs['fld'] + "Options"]) {
                // extract from lookups
                var i = scope.$parent["f_" + attrs['fld'] + "Options"].indexOf(newVal);
                if (i > -1) {
                  newVal = scope.$parent["f_" + attrs['fld'] + "_ids"][i];
                }
                else {
                  newVal = undefined;
                }
              }
              else {
                newVal = undefined;
              }
              if (newVal) {
                scope['link'] = RoutingService.buildUrl(ref + '/' + form + (newVal.id || newVal) + '/edit' + linktab);
              }
              else {
                scope['link'] = undefined;
              }
            }
            else {
              scope['link'] = undefined;
            }
          }, true);
        } else {
          if (attrs['text'] && attrs['text'].length > 0) {
            scope['text'] = attrs['text'];
          }
          var index = scope['$parent']['$index'];
          scope.$watch('dataSrc()', function(newVal: string) {
            if (newVal) {
              if (typeof index !== 'undefined' && angular.isArray(newVal)) {
                newVal = newVal[index];
              }
              scope['link'] = RoutingService.buildUrl(ref + '/' + form + newVal + '/edit' + linktab);
              if (!scope['text']) {
                SubmissionsService.getListAttributes(ref, newVal).then(function(response) {
                  let data: any = response.data;
                  if (data.success === false) {
                    scope['text'] = data.err;
                  } else {
                    scope['text'] = data.list;
                  }
                }, function(response) {
                  scope['text'] = 'Error ' + response.status + ': ' + response.data;
                });
              }
            }
          }, true);
        }
      },
      controller: "LinkCtrl",
      template: function (element, attrs) {

        function handleAnchor(contents: string) : string {
          return `<a ng-click="checkNotModal()" ng-href="{{ link || '#' }}" class="fng-link">${contents}</a>`;
        }

        let retVal: string;
        if (attrs.readonly) {
          retVal = '<span class="fng-link">{{text}}</span>';
        } else if (attrs['text'] && unescape(attrs['text']) !== attrs['text']) {
          retVal = handleAnchor(unescape(attrs['text']));
          // retVal = '<a href="{{ link }}" class="fng-link">{{text}}</a>';
        } else {
          retVal = handleAnchor('{{text}}');
        }
        return retVal;
      }
    };
  }
}
