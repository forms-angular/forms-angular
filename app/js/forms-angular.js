'use strict';

var formsAngular = angular.module('formsAngular', [
    'ui.select2'
    , 'ui.date'

    // seems a bit silly to do this as all of ui-bootstrap is being loaded, but one day I may want to change that, so this serves as a list
    , 'ui.bootstrap.dropdownToggle'

    , 'ui.bootstrap.tabs'
    , 'template/tabs/tab.html'
    , 'template/tabs/tabset.html'

//    , 'ui.bootstrap.datepicker'
//    , 'template/datepicker/datepicker.html'
]);

// Ideally would want a config call in here which adds the routes, below, but couldn't get it to work
//    when('/:model/:id/edit', {templateUrl: 'partials/base-edit.html', controller: "BaseCtrl"}).
//    when('/:model/new', {templateUrl: 'partials/base-edit.html', controller: "BaseCtrl"}).
//    when('/:model', {templateUrl: 'partials/base-list.html', controller: "BaseCtrl"}).
//    when('/:model/:form/:id/edit', {templateUrl: 'partials/base-edit.html', controller: "BaseCtrl"}).  // non default form (different fields etc)
//    when('/:model/:form/new', {templateUrl: 'partials/base-edit.html', controller: "BaseCtrl"}).       // non default form (different fields etc)
//    when('/:model/:form', {templateUrl: 'partials/base-list.html', controller: "BaseCtrl"}).           // list page with links to non default form

formsAngular.value('ui.config', {
    date: {
        dateFormat: 'dd/mm/yy'
    }
});
