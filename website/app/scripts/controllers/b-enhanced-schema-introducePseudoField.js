'use strict';
websiteApp.controller('BEnhancedSchemaIntroducePseudoFieldCtrl', ['$scope', function ($scope) {

  $scope.$parent.onSchemaFetch = function(description, schema) {
    void description;
    void schema;
    /*
    Make modifications to the mongoose schema, if desired
    This can be called multiple times - description is of the form 'Main <collection>' (in this case "Main b_enhanced_schema")
    or 'Nested <schemaName>' (in this case 'Nested photo' for example')
     */
  };

  $scope.$parent.onSchemaProcessed = function(description, schema) {
    /*
    Make modifications to the mongoose schema, if desired
    This can be called multiple times - description is of the form 'Main <collection>' (in this case "Main b_enhanced_schema")
    or 'Nested <schemaName>' (in this case 'Nested photo' for example')
     */
    if (description.slice(0,4) === 'Main') {
      schema.splice(1,0,{name:'Pseudo', label:'A run time pseudo field',
        help: 'A potential use case for this would be to offer different editors depending on some value, using showWhen'});
    }
  };

}]);
