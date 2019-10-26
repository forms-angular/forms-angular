import {INType} from "../../interfaces/n_type";

websiteApp.controller('NTypescriptSchemaCtrl', ['$scope', function ($scope) {

  $scope.onAllReady = function () {
    if (!$scope.isNew) {
      let a: INType = $scope.sharedData.record;
      console.log(`The surname in UPPER CASE is ${a.surname.toUpperCase()}`);       // We have shared type checking on client and server
    }
  };
}]);
