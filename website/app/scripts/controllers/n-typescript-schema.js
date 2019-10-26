"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
websiteApp.controller('NTypescriptSchemaCtrl', ['$scope', function ($scope) {
        $scope.onAllReady = function () {
            if (!$scope.isNew) {
                let a = $scope.sharedData.record;
                console.log(`The surname in UPPER CASE is ${a.surname.toUpperCase()}`); // We have shared type checking on client and server
            }
        };
    }]);
//# sourceMappingURL=n-typescript-schema.js.map