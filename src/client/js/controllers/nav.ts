/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.controllers {

  /*@ngInject*/
  export function NavCtrl($rootScope, $window, $scope, $location, $filter, routingService, cssFrameworkService) {

    function clearContextMenu() {
      $scope.items = [];
      $scope.contextMenu = undefined;
    }

    $rootScope.navScope = $scope;  // Lets plugins access menus
    $rootScope.isSecurelyHidden = function (elemId) {
      return formsAngular.elemSecurityFuncName && $rootScope[formsAngular.elemSecurityFuncName](elemId, "hidden");
    }
    $rootScope.isSecurelyDisabled = function (elemId) {
      return formsAngular.elemSecurityFuncName && $rootScope[formsAngular.elemSecurityFuncName](elemId, "disabled");
    }
    clearContextMenu();

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
      } else if (event.keyCode === 83 && event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey) {
        deferredBtnClick('saveButton');                           // Ctrl+Shift+S saves changes
      } else if (event.keyCode === 27 && ((event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey) || $scope.showShortcuts)) {
        if (event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey) {
          deferredBtnClick('cancelButton');                         // Ctrl+Shift+Esc cancels updates
        } else {
          $scope.showShortcuts = false;
        }
      } else if (event.keyCode === 45 && event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey) {
        deferredBtnClick('newButton');                           // Ctrl+Shift+Ins creates New record
      } else if (event.keyCode === 88 && event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey) {
        deferredBtnClick('deleteButton');                        // Ctrl+Shift+X deletes record
      }
    };

    $scope.css = function (fn, arg) {
      var result;
      if (typeof cssFrameworkService[fn] === 'function') {
        result = cssFrameworkService[fn](arg);
      } else {
        result = 'error text-error';
      }
      return result;
    };

    $scope.$on('fngControllersLoaded', function(evt, sharedData, modelName) {
      $scope.contextMenu = sharedData.dropDownDisplay || sharedData.modelNameDisplay || $filter('titleCase')(modelName, false);
      if (sharedData.dropDownDisplayPromise) {
        sharedData.dropDownDisplayPromise.then((value) => {
          $scope.contextMenu = value;
        });
      }
    });

    $scope.$on('fngControllersUnloaded', function(evt) {
      clearContextMenu();
    });

    $scope.doClick = function (index, event) {
      const option = angular.element(event.target);
      const item = $scope.items[index];
      if (item.divider || option.parent().hasClass('disabled')) {
        event.preventDefault();
      } else if (item.broadcast) {
        $scope.$broadcast(item.broadcast);
      } else {
        // Performance optimization: http://jsperf.com/apply-vs-call-vs-invoke
        const args = item.args || [];
        const fn = item.fn;
        if (typeof fn === "function") {
          switch (args.length) {
            case  0:
              fn();
              break;
            case  1:
              fn(args[0]);
              break;
            case  2:
              fn(args[0], args[1]);
              break;
            case  3:
              fn(args[0], args[1], args[2]);
              break;
            case  4:
              fn(args[0], args[1], args[2], args[3]);
              break;
          }
        } else if (fn) {
          throw new Error("Incorrect menu setup")
        }
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
      return routingService.buildUrl(path);
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
