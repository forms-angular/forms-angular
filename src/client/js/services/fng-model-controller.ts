/// <reference path="../../index.d.ts" />

module fng.services {

  /*@ngInject*/
  export function FngModelCtrlService($controller: angular.IControllerService) {

    return {
      loadControllerAndMenu: function (sharedData: any, controllerName: string, level: number, needDivider: boolean, localScope: any) {

        let locals: any = {}, addThis;

        controllerName += 'Ctrl';
        locals.$scope = sharedData.modelControllers[level] = localScope;
        let parentScope = localScope.$parent;
        parentScope.items = parentScope.items || [];

        let addMenuOptions = function (array: Array<fng.IContextMenuOption & fng.IContextMenuDivider>) {
          angular.forEach(array, function (value) {
            if (value.divider) {
              needDivider = true;
            } else if (value[addThis]) {
              if (needDivider) {
                needDivider = false;
                parentScope.items.push({divider: true});
              }
              if (!value.id) {
                // if it doesn't have an id, give it one, so every menu item is possible to secure
                value.id = _.camelCase(value.text || value.textFunc() || "");
              }
              parentScope.items.push(value);
            }
          });
        };

        try {
          $controller(controllerName, locals);
          if (parentScope.newRecord) {
            addThis = 'creating';
          } else if (parentScope.id) {
            addThis = 'editing';
          } else {
            addThis = 'listing';
          }
          if (angular.isObject(locals.$scope.contextMenu)) {
            addMenuOptions(locals.$scope.contextMenu);
            if (locals.$scope.contextMenuPromise) {
              locals.$scope.contextMenuPromise.then(
                (array) => addMenuOptions(array)
              )
            }
          }
          if (sharedData.modelNameDisplayPromise) {
            sharedData.modelNameDisplayPromise.then(value => {
              parentScope.modelNameDisplay = value;
            })
          }
        } catch (error) {
          // Check to see if error is no such controller - don't care
          if ((!(/is not a function, got undefined/.test(error.message))) && (!(/\[\$controller:ctrlreg\] The controller with the name/.test(error.message)))) {
            console.log('Unable to instantiate ' + controllerName + ' - ' + error.message);
          }
        }
      }


    }

  }

  FngModelCtrlService.$inject = ["$controller"];
}

