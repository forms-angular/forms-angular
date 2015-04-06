/// <reference path="../typings/angularjs/angular.d.ts" />

module fng {

  export var formsAngular = angular.module('formsAngular', [
    'ngSanitize',
    'ui.bootstrap',
    'infinite-scroll',
    'monospaced.elastic'
  ]);

  void(formsAngular);  // Make jshint happy

}
