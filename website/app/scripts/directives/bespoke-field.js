'use strict';
websiteApp.directive('emailField', ['$compile', '$filter', 'pluginHelper', 'formMarkupHelper', 'cssFrameworkService',
  function ($compile, $filter, pluginHelper, formMarkupHelper, cssFrameworkService) {
    return {
      restrict: 'E',
      replace: true,
      priority: 1,
      compile: function () {
        return function (scope, element, attrs) {
          var template;
          var processedAttr = pluginHelper.extractFromAttr(attrs, 'emailField');
          template = pluginHelper.buildInputMarkup(
            scope,
            attrs,
            {
              processedAttr
            },
            function (buildingBlocks) {
              const atSign = {};
              if (cssFrameworkService.framework() === 'bs2') {
                atSign.prepend = '<div class="input-prepend"><span class="add-on">@</span>';
                atSign.append = '</div>';
              } else {
                atSign.prepend = '<div class="input-group"><div class="input-group-addon ' + buildingBlocks.compactClass + '">@</div>';
                atSign.append = '</div>';
              }
              const inputMarkup = buildingBlocks.common + formMarkupHelper.addTextInputMarkup(buildingBlocks, processedAttr.info, '');
              return (
                atSign.prepend +
                formMarkupHelper.generateSimpleInput(
                  inputMarkup,
                  processedAttr.info,
                  processedAttr.options
                ) +
                atSign.append
              );
            }
          );
          element.replaceWith($compile(template)(scope));
        };
      }
    };
  }]
);

