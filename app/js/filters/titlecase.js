'use strict';

formsAngular.filter('titleCase', [function () {
  return function (str, stripSpaces) {
    var value = str
      .replace(/(_|\.)/g, ' ')                       // replace underscores and dots with spaces
      .replace(/[A-Z]/g, ' $&').trim()               // precede replace caps with a space
      .replace(/\w\S*/g, function (txt) {            // capitalise first letter of word
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    if (stripSpaces) {
      value = value.replace(/\s/g, '');
    } else {
      // lose double spaces
      value = value.replace(/\s{2,}/g, ' ');
    }
    return value;
  };
}]);