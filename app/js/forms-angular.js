'use strict';

var formsAngular = angular.module('formsAngular', [
	  'ngRoute'
    , 'ngSanitize'
    , 'ui.select2'
    , 'ui.date'
    , 'fng.ui.bootstrap'
    , 'ui.bootstrap'
    , 'ngGrid'
    , 'infinite-scroll'
]);

// Ideally would want a config call in here which adds the routes, below, but couldn't get it to work
//    when('/analyse/:model/:reportSchemaName', {templateUrl: 'partials/base-analysis.html'}).
//    when('/analyse/:model', {templateUrl: 'partials/base-analysis.html'}).
//    when('/:model/:id/edit', {templateUrl: 'partials/base-edit.html'}).
//    when('/:model/new', {templateUrl: 'partials/base-edit.html'}).
//    when('/:model', {templateUrl: 'partials/base-list.html'}).
//    when('/:model/:form/:id/edit', {templateUrl: 'partials/base-edit.html'}).  // non default form (different fields etc)
//    when('/:model/:form/new', {templateUrl: 'partials/base-edit.html'}).       // non default form (different fields etc)
//    when('/:model/:form', {templateUrl: 'partials/base-list.html'}).           // list page with links to non default form

