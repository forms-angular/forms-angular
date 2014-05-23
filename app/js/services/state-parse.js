/**
 * Created by DominicBoettger on 09.04.14.
 *
 * Parser for the states provided by ui.router
 */
'use strict';
formsAngular.factory('$stateParse', [function () {

  var lastObject = {};

  return function (state) {
    if (state.current && state.current.name) {
      lastObject = {newRecord: false};
      lastObject.modelName = state.params.model;
      if (state.current.name === 'model::list') {
        lastObject = {index: true};
        lastObject.modelName = state.params.model;
      } else if (state.current.name === 'model::edit') {
        lastObject.id = state.params.id;
      } else if (state.current.name === 'model::new') {
        lastObject.newRecord = true;
      } else if (state.current.name === 'model::analyse') {
        lastObject.analyse = true;
      }
    }
    return lastObject;
  };
}]);