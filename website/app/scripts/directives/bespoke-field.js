'use strict';
websiteApp.directive('emailField', ['$compile', '$filter', 'PluginHelperService', 'FormMarkupHelperService', 'CssFrameworkService',
  function ($compile, $filter, PluginHelperService, FormMarkupHelperService, CssFrameworkService) {
    return {
      restrict: 'E',
      replace: true,
      priority: 1,
      compile: function () {
        return function (scope, element, attrs) {
          var template;
          var processedAttr = PluginHelperService.extractFromAttr(attrs, 'emailField');
          template = PluginHelperService.buildInputMarkup(
            scope,
            attrs,
            {
              processedAttr
            },
            function (buildingBlocks) {
              const atSign = {};
              if (CssFrameworkService.framework() === 'bs2') {
                atSign.prepend = '<div class="input-prepend"><span class="add-on">@</span>';
                atSign.append = '</div>';
              } else {
                atSign.prepend = '<div class="input-group"><div class="input-group-addon ' + buildingBlocks.compactClass + '">@</div>';
                atSign.append = '</div>';
              }
              const inputMarkup = buildingBlocks.common + FormMarkupHelperService.addTextInputMarkup(buildingBlocks, processedAttr.info, '');
              return (
                atSign.prepend +
                FormMarkupHelperService.generateSimpleInput(
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

