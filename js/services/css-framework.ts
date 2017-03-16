/// <reference path="../../node_modules/@types/angular/index.d.ts" />

module fng.services {

  /*@ngInject*/
  export function cssFrameworkService() {
    // Bootstrap 3 is now the only supported framework
    // Bootstrap 2 can be made to work - an example can be made available if you request on gitter.
    var config = {
      framework: 'bs3'
    };

    return {
      setOptions: function (options) {
        angular.extend(config, options);
      },
      $get: function () {
        return {
          framework: function () {
            return config.framework;
          },
          // This next function is just for the demo website - don't use it
          setFrameworkForDemoWebsite: function (framework) {
            config.framework = framework;
          },
          span: function (cols) {
            var result;
            switch (config.framework) {
              case 'bs2' :
                result = 'span' + Math.floor(cols);
                break;
              case 'bs3' :
                result = 'col-xs-' + Math.floor(cols);
                break;
            }
            return result;
          },
          offset: function (cols) {
            var result;
            switch (config.framework) {
              case 'bs2' :
                result = 'offset' + Math.floor(cols);
                break;
              case 'bs3' :
                result = 'col-lg-offset-' + Math.floor(cols);
                break;
            }
            return result;
          },
          rowFluid: function () {
            var result;
            switch (config.framework) {
              case 'bs2' :
                result = 'row-fluid';
                break;
              case 'bs3' :
                result = 'row';
                break;
            }
            return result;
          }
        };
      }
    };
  }
}
