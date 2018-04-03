/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />
/// <reference path="../fng-types" />
var fng;
(function (fng) {
    var services;
    (function (services) {
        /*@ngInject*/
        function fngModelCtrlService($controller) {
            return {
                loadControllerAndMenu: function (sharedData, controllerName, level, needDivider, localScope) {
                    var locals = {}, addThis;
                    controllerName += 'Ctrl';
                    locals.$scope = sharedData.modelControllers[level] = localScope;
                    var parentScope = localScope.$parent;
                    var addMenuOptions = function (array) {
                        angular.forEach(array, function (value) {
                            if (value.divider) {
                                needDivider = true;
                            }
                            else if (value[addThis]) {
                                if (needDivider) {
                                    needDivider = false;
                                    parentScope.items.push({ divider: true });
                                }
                                parentScope.items.push(value);
                            }
                        });
                    };
                    try {
                        $controller(controllerName, locals);
                        if (parentScope.newRecord) {
                            addThis = 'creating';
                        }
                        else if (parentScope.id) {
                            addThis = 'editing';
                        }
                        else {
                            addThis = 'listing';
                        }
                        if (angular.isObject(locals.$scope.contextMenu)) {
                            addMenuOptions(locals.$scope.contextMenu);
                            if (locals.$scope.contextMenuPromise) {
                                locals.$scope.contextMenuPromise.then(function (array) { return addMenuOptions(array); });
                            }
                        }
                    }
                    catch (error) {
                        // Check to see if error is no such controller - don't care
                        if ((!(/is not a function, got undefined/.test(error.message))) && (!(/\[\$controller:ctrlreg\] The controller with the name/.test(error.message)))) {
                            console.log('Unable to instantiate ' + controllerName + ' - ' + error.message);
                        }
                    }
                }
            };
        }
        services.fngModelCtrlService = fngModelCtrlService;
        fngModelCtrlService.$inject = ["$controller"];
    })(services = fng.services || (fng.services = {}));
})(fng || (fng = {}));
//# sourceMappingURL=fng-model-controller.js.map