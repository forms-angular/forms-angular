/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />
var fng;
(function (fng) {
    var controllers;
    (function (controllers) {
        /*@ngInject*/
        function SaveChangesModalCtrl($scope, $uibModalInstance) {
            $scope.yes = function () {
                $uibModalInstance.close(true);
            };
            $scope.no = function () {
                $uibModalInstance.close(false);
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }
        controllers.SaveChangesModalCtrl = SaveChangesModalCtrl;
    })(controllers = fng.controllers || (fng.controllers = {}));
})(fng || (fng = {}));
//# sourceMappingURL=saveChangesModal.js.map