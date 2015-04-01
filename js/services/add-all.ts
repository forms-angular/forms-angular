'use strict';

formsAngular.service('addAllService', function () {

  this.getAddAllGroupOptions = function (scope, attrs, classes) {
    return getAddAllOptions(scope, attrs, 'Group', classes);
  };

  this.getAddAllFieldOptions = function (scope, attrs, classes) {
    return getAddAllOptions(scope, attrs, 'Field', classes);
  };

  this.getAddAllLabelOptions = function (scope, attrs, classes) {
    return getAddAllOptions(scope, attrs, 'Label', classes);
  };

  this.addAll = function (scope, type, additionalClasses, options) {
    var action = 'getAddAll' + type + 'Options';
    return this[action](scope, options, additionalClasses) || [];
  };

  function getAddAllOptions(scope, attrs, type, classes) {

    var addAllOptions = [],
      classList = [],
      tmp, i, options;

    type = 'addAll' + type;

    if (typeof(classes) === 'string') {
      tmp = classes.split(' ');
      for (i = 0; i < tmp.length; i++) {
        classList.push(tmp[i]);
      }
    }

    function getAllOptions(obj) {

      for (var key in obj) {
        if (key === type) {
          addAllOptions.push(obj[key]);
        }

        if (key === '$parent') {
          getAllOptions(obj[key]);
        }
      }
    }

    getAllOptions(scope);

    if (attrs[type] !== undefined) {
      // TODO add support for objects and raise error on invalid types
      if (typeof(attrs[type]) === 'string') {

        tmp = attrs[type].split(' ');

        for (i = 0; i < tmp.length; i++) {
          if (tmp[i].indexOf('class=') === 0) {
            classList.push(tmp[i].substring(6, tmp[i].length));
          } else {
            addAllOptions.push(tmp[i]);
          }
        }
      }
    }

    if (classList.length > 0) {
      classes = ' class="' + classList.join(' ') + '" ';
    } else {
      classes = ' ';
    }

    if (addAllOptions.length > 0) {
      options = addAllOptions.join(' ') + ' ';
    } else {
      options = '';
    }

    return classes + options;

  }

});
