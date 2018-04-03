websiteApp.directive('timezone', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.timezone = function(modelValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }

        if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
          throw 'Time zones are not available in this environment';
        }

        try {
          Intl.DateTimeFormat(undefined, {timeZone: modelValue});
          return true;
        }
        catch (ex) {
          return false;
        }

      };
    }
  };
});


