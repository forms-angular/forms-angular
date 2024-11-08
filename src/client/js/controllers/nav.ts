/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.controllers {

  /*@ngInject*/
  export function NavCtrl(
    $rootScope: angular.IRootScopeService & { navScope?: any },
    $window: angular.IWindowService,
    $scope,
    $filter,
    RoutingService: fng.IRoutingService,
    CssFrameworkService: fng.ICssFrameworkService,
    SecurityService: fng.ISecurityService
  ) {
    $scope.clearContextMenu = function() {
      $scope.items = [];
      $scope.contextMenu = undefined;
      $scope.contextMenuId = undefined;
      $scope.contextMenuHidden = undefined;
      $scope.contextMenuDisabled = undefined;
    }

    $rootScope.navScope = $scope;  // Lets plugins access menus
    $scope.clearContextMenu();

    $scope.toggleCollapsed = function() {
      $scope.collapsed = !$scope.collapsed;
    };

    /* isCollapsed and showShortcuts are used to control how the menu is displayed in a responsive environment and whether the shortcut keystrokes help should be displayed */
    $scope.isCollapsed = true;
    $scope.showShortcuts = false;
    $scope.shortcuts = [
      {key:'?', act:'Show shortcuts'},
      {key:'/', act:'Jump to search'},
      {key:'Ctrl+Shift+S', act:'Save the current record'},
      {key:'Ctrl+Shift+Esc', act:'Cancel changes on the current record'},
      {key:'Ctrl+Shift+Ins', act:'Create a new record'},
      {key:'Ctrl+Shift+X', act:'Delete the current record'}
    ];

    formsAngular.keyboardShortCuts?.forEach(sc => {
      $scope.shortcuts.push({key: 'Ctrl+Shift+' + sc.letter, act: sc.desc});
    })

    $scope.markupShortcut = function(keys) {
      return '<span class="key">' + keys.split('+').join('</span> + <span class="key">') + '</span>';
    };

    $scope.globalShortcuts = function (event) {

      function deferredBtnClick(id) {
        var btn:HTMLButtonElement = <HTMLButtonElement>document.getElementById(id);
        if (btn) {
          if (!btn.disabled) {
            setTimeout(function () {
              btn.click();
            });
          }
          event.preventDefault();
        }
      }

      function filter(event){
        var tagName = (event.target).tagName;
        return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA' || tagName == "DIV" && event.target.classList.contains('ck-editor__editable'));
      }

      //console.log(event.keyCode, event.ctrlKey, event.shiftKey, event.altKey, event.metaKey);

      const ctrlShift = event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey;
      if (event.keyCode === 191 && (filter(event) || (event.ctrlKey && !event.altKey && !event.metaKey))) {
        if (event.ctrlKey || !event.shiftKey) {
          var searchInput = document.getElementById('searchinput');
          if (searchInput) {
            searchInput.focus();
            event.preventDefault();
          }
        } else {
          $scope.showShortcuts = true;
        }
      } else if (event.keyCode === 27 && ((ctrlShift) || $scope.showShortcuts)) {
        if (ctrlShift) {
          deferredBtnClick('cancelButton');                         // Ctrl+Shift+Esc cancels updates
        } else {
          $scope.showShortcuts = false;
        }
      } else if (ctrlShift) {
        if (event.keyCode === 83) {
          deferredBtnClick('saveButton');                           // Ctrl+Shift+S saves changes
        } else if (event.keyCode === 45) {
          deferredBtnClick('newButton');                           // Ctrl+Shift+Ins creates New record
        } else if (event.keyCode === 88) {
          deferredBtnClick('deleteButton');                        // Ctrl+Shift+X deletes record
        } else if (formsAngular.keyboardShortCuts) {
          formsAngular.keyboardShortCuts.forEach((sc) => {
            if (event.keyCode === sc.keycode) {
              deferredBtnClick(sc.id);
            }
          })
        }
      }
    };

    $scope.css = function (fn, arg) {
      var result;
      if (typeof CssFrameworkService[fn] === 'function') {
        result = CssFrameworkService[fn](arg);
      } else {
        result = 'error text-error';
      }
      return result;
    };

    function initialiseContextMenu(menuCaption: string): void {
      $scope.contextMenu = menuCaption;
      const menuId = `${_.camelCase(menuCaption)}ContextMenu`;
      // the context menu itself (see dropdown.ts) has an ng-if that checks for a value of
      // contextMenuId.  let's delete this until we know we're ready to evaluate the security
      // of the menu items...
      $scope.contextMenuId = undefined;
      SecurityService.doSecurityWhenReady(() => {
        //... which we now are
        $scope.contextMenuId = menuId;
        $scope.contextMenuHidden = SecurityService.isSecurelyHidden($scope.contextMenuId);
        $scope.contextMenuDisabled = SecurityService.isSecurelyDisabled($scope.contextMenuId);
      });
    }

    $scope.$on('fngControllersLoaded', function(evt, sharedData, modelName) {
      initialiseContextMenu(sharedData.dropDownDisplay || sharedData.modelNameDisplay || $filter('titleCase')(modelName, false));
      if (sharedData.dropDownDisplayPromise) {
        sharedData.dropDownDisplayPromise.then((value) => {
          initialiseContextMenu(value);
        });
      }
    });

    $scope.$on('fngControllersUnloaded', function(evt) {
      $scope.clearContextMenu();
    });

    $scope.doClick = function (index: number, event, item: fng.IContextMenuOption & fng.IContextMenuDivider) {
      const option = angular.element(event.target);
      item = item || $scope.items[index];
      if (item.divider || option.parent().hasClass('disabled')) {
        event.preventDefault();
      } else if (item.broadcast) {
        $rootScope.$broadcast(item.broadcast, ...(item.args || []));
      } else if (typeof item.fn === "function") {
        item.fn(...(item.args || []));
      } else if (item.fn) {
        throw new Error("Incorrect menu setup")
      }
    };

    $scope.isHidden = function (index) {

      function explicitlyHidden(item): boolean {
        return item.isHidden ? item.isHidden() : false
      }

      let dividerHide = false;
      const item = $scope.items[index];
      // Hide a divider if it appears under another
      if (item.divider) {
        if (index === 0) {
          dividerHide = true;
        } else {
          let foundVisible = false;
          let check = index - 1;
          while (check >= 0 && !dividerHide && !foundVisible) {
            if ($scope.items[check].divider) {
              dividerHide = true;
            } else if (!explicitlyHidden($scope.items[check])) {
              foundVisible = true;
            } else {
              --check;
            }
          }
        }
      }
      return dividerHide || explicitlyHidden(item);
    };

    $scope.isDisabled = function (index) {
      return $scope.items[index].isDisabled ? $scope.items[index].isDisabled() : false;
    };

    $scope.buildUrl = function (path) {
      return RoutingService.buildUrl(path);
    };

    $scope.dropdownClass = function (index) {
      var item = $scope.items[index];
      var thisClass = '';
      if (item.divider) {
        thisClass = 'divider';
      } else if ($scope.isDisabled(index)) {
        thisClass = 'disabled';
      }
      return thisClass;
    };

    let originalTitle = $window.document.title;
    $scope.$on('$routeChangeSuccess', function () {
      $window.document.title = originalTitle;
    })

  }
}
