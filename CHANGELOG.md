# forms-angular

## 0.4 to 0.5
### Summary
* Required and readonly now work consistently across input types
* Some styling improvements for required fields and mobile
* Added support for ui-select plugin, and in so doing added new services (formMarkupHelper, pluginHelper) that make it
much easier to add new plugins.

### BREAKING CHANGES
* Changed id generation to remove . characters.  This may break some tests (but the . characters themselves were upsetting 
some testing software).
* Removed body padding from styling.  If you use a navbar you should put body {padding-top: 40px} (or required navbar height) in your styling. 

## 0.3 to 0.4
### Summary
* Split the project into multiple repos and made a yeoman generator
* Removes dependence on jQuery
* ngRoute is no longer a dependency - either ngRoute or ui.router can be used, and a new provider allows the choice to be
set up as follows:
```
  formsAngular.config(['routingServiceProvider', function (routingService) {
      routingService.setOptions({html5Mode: true, routing: 'ngroute'});
      }]);
```      
This service incorporates some of the functionality of the old form routes provider and supersedes urlService and 
locationParse.

For example in 0.3.x where you had something like:
```
plaitApp.config(['formRoutesProvider', function (formRoutes) {
    formRoutes.setRoutes([
        {route: '/index', options: {templateUrl: 'partials/menu.html'}},
        {route: '/login', options: {templateUrl: 'partials/login.html' }},
        {route: '/client/referral', options: {templateUrl: 'partials/upload', controller: 'ClientReferralCtrl'}}
    ], '/index');
```    
you would have something like
```
formsAngular.config(['routingServiceProvider', function (routingService) {
  routingService.start({
    routing: 'ngroute',
    fixedRoutes: [
      {route: '/index', options: {templateUrl: 'partials/menu.html'}},
      {route: '/login', options: {templateUrl: 'partials/login.html' }},
      {route: '/404', options: {templateUrl: 'partials/404.html'}},
      {route: '/client/referral', options: {templateUrl: 'partials/upload', controller: 'ClientReferralCtrl'}}
    ]
  });
```
* The ability to add a routing prefix has been added
 
### BREAKING CHANGES
* List API returns only one field when no list fields defined (as happens on the client).
* Hidden list fields now appear on list API response.
* In BaseCtrl $scope.new() and $scope.delete() have been renamed ('Click' added)
* 

## 0.2 to 0.3
### Summary
* Improvements to routing:
 * Module specific routes are now specified with a call to the setRoutes(appRoutes, defaultRoute) method of an injected
   formRoutesProvider - see the breaking changes section for an example and details.
 * Support for HTML5Mode and hashPrefix, including a service to simplify use
 * Support for Twitter Bootstrap 3, including a service to simplify use.  To use Bootstrap 3 you need to upgrade a few of the
 libraries that Bower installs.  Change the following lines in bower.json:
```   
     "angular-ui-bootstrap-bower": "0.8.0",
     "bootstrap": "2.3.2",
     "select2-bootstrap-css": "~1.2",
```
     to
```      
     "angular-ui-bootstrap-bower": "0.11.0",
     "bootstrap": "3.1.1",
     "select2-bootstrap-css": "~1.3",
```     


### BREAKING CHANGES
* Routing has changed - replace
```
myModule.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/index', {templateUrl: 'partials/landing-page.html'}).
        when('/someRoute', {templateUrl: 'partials/someTemplate.html'}).
        ... etc ...
        when('/analyse/:model/:reportSchemaName', {templateUrl: 'partials/base-analysis.html'}).
        when('/analyse/:model', {templateUrl: 'partials/base-analysis.html'}).
        when('/:model/:id/edit', {templateUrl: 'partials/base-edit.html'}).
        when('/:model/new', {templateUrl: 'partials/base-edit.html'}).
        when('/:model', {templateUrl: 'partials/base-list.html'}).
        when('/:model/:form/:id/edit', {templateUrl: 'partials/base-edit.html'}).  // non default form (different fields etc)
        when('/:model/:form/new', {templateUrl: 'partials/base-edit.html'}).       // non default form (different fields etc)
        when('/:model/:form', {templateUrl: 'partials/base-list.html'}).           // list page with links to non default form
        otherwise({redirectTo: '/index'});
}]);
```
with
```
myModule.config(['formRoutesProvider', function (formRoutes) {
	formRoutes.setRoutes([
        {route:'/index', options:{templateUrl: 'partials/landing-page.html'}},
        {route:'/someRoute', options:{templateUrl: 'partials/someTemplate.html'}}
        ], '/index');
}]);
```
where the first parameter is an array of objects containing a route and a set of options (which are passed straight to
[$routeProvider](http://docs.angularjs.org/api/ngRoute/provider/$routeProvider) and the second parameter is the default route.
* Stylesheets have moved down into a ./css folder relative to where they were, and there
are now Bootstrap 2 and Bootstrap 3 versions.
* You should initialise formsAngular with something similar to:
```
formsAngular.config(['urlServiceProvider', 'cssFrameworkServiceProvider', function (urlService, cssFrameworkService) {
    urlService.setOptions({html5Mode: false, hashPrefix: '!'});
    cssFrameworkService.setOptions({framework: 'bs2'});  // bs2 and bs3 are supported
  }]);
```
* Report drilldowns now start from the model
```
drilldown: '/#/g_conditional_fields/!_id!/edit'
drilldown: '/#!/g_conditional_fields/|_id|/edit'
```
both become
```
drilldown: 'g_conditional_fields/|_id|/edit'
```

## 0.1 to 0.2
### Summary
* Support for radio button groups, CKEditor
* Internal changes to make better use of Angular JS forms capabilities
* Added support for HTML5 input capabilities: pattern, min, max, step
* All lookups are now handled as {id:xxx, text:yyy} on the client
* default ids now generated by form directive (and no longer by BaseCtrl)
* Added customFooter and customSubDoc for sub docs
* Improvements to search: now a directive; makes use of arrow keys and escape; some bug fixes
* showWhen conditional field display introduced (showIf will probably be deprecated)

### BREAKING CHANGES
* Changed form-input directive so that it creates a form tag, and rather than creating a <form-input>
per sub document it now creates a <ng-form> and builds the sub-form in the same pass.  Only when using
directives are multiple passes required.
* Bespoke directives that use schema need to be modified (changes will normally be from something like
```
    var info = scope[attrs.schema][0];
```
to
```
    var info = scope[attrs.schema];
```
* Password type is still used generated automatically if the label contains the string 'password', but the override
method is now to use the form type (password is it is a password, text if not).
* We have followed ui-bootstrap's renaming of tabs / panes to tabsets / tabs, so any use of "pane" in your form objects
needs to be changed to tab.
* Support for allowing crawling meant that !(shriek) had to be replaced with |(pipe) in report drill down urls replacement
* Some default id formats changed in subdocuments, which may affect tests etc

## 0.0.x to 0.1.0
### Summary
* Started CHANGELOG.md (but for now it is far from definitive, but is intended to include all breaking changes)
* Added support for containers (documented in Custom Form Schemas section of documentation)
* Added reporting capability
* New website

### BREAKING CHANGES
* Changes form-input directive so that it expects
```
    <form-input schema="formSchema">
```    
instead of
```
    <form-input ng-repeat="field in formSchema" info={{field}}>
```
* findFunc option now returns a query object such as
```
    {field:'value'}
```
rather than a MongooseJS Query such as
```
    model.find().where('field', 'value')
```
* Bespoke directives that use schema need to be modified (changes will normally be from something like
```
    var info = JSON.parse(attrs.info);
```
to
```
    var info = scope[attrs.schema][0];
```
* One formInputDone is broadcast per form (instead of per field).
