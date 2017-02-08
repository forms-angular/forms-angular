/// <reference path="../../typings/globals/angular/index.d.ts" />

module fng.controllers {

  /*@ngInject*/
  export function NavCtrl($scope, $data, $location, $filter, $controller, routingService, cssFrameworkService) {

    $scope.items = [];

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
        var tagName = (event.target || event.srcElement).tagName;
        return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
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
      } else if (event.keyCode === 88 && event.ctrlKey && event.shiftKey && event.altKey && !event.metaKey) {
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

    function loadControllerAndMenu(controllerName, level, needDivider) {
      var locals: any = {}, addThis;

      controllerName += 'Ctrl';
      locals.$scope = $data.modelControllers[level] = $scope.$new();
      try {
        $controller(controllerName, locals);
        if ($scope.routing.newRecord) {
          addThis = 'creating';
        } else if ($scope.routing.id) {
          addThis = 'editing';
        } else {
          addThis = 'listing';
        }
        if (angular.isObject(locals.$scope.contextMenu)) {
          angular.forEach(locals.$scope.contextMenu, function (value) {
            if (value.divider) {
              needDivider = true;
            } else if (value[addThis]) {
              if (needDivider) {
                needDivider = false;
                $scope.items.push({divider: true});
              }
              $scope.items.push(value);
            }
          });
        }
      } catch (error) {
        // Check to see if error is no such controller - don't care
        if ((!(/is not a function, got undefined/.test(error.message))) && (!(/\[\$controller:ctrlreg\] The controller with the name/.test(error.message)))) {
          console.log('Unable to instantiate ' + controllerName + ' - ' + error.message);
        }
      }
    }

    $scope.$on('$locationChangeSuccess', function () {

      $scope.routing = routingService.parsePathFunc()($location.$$path);

      $scope.items = [];

      if ($scope.routing.analyse) {
        $scope.contextMenu = 'Report';
        $scope.items = [
          {
            broadcast: 'exportToPDF',
            text: 'PDF'
          },
          {
            broadcast: 'exportToCSV',
            text: 'CSV'
          }
        ];
      } else if ($scope.routing.modelName) {

        angular.forEach($data.modelControllers, function (value) {
          value.$destroy();
        });
        $data.modelControllers = [];
        $data.record = {};
        $data.disableFunctions = {};
        $data.dataEventFunctions = {};
        delete $data.dropDownDisplay;
        delete $data.modelNameDisplay;
        // Now load context menu.  For /person/client/:id/edit we need
        // to load PersonCtrl and PersonClientCtrl
        var modelName = $filter('titleCase')($scope.routing.modelName, true);
        var needDivider = false;
        loadControllerAndMenu(modelName, 0, needDivider);
        if ($scope.routing.formName) {
          loadControllerAndMenu(modelName + $filter('titleCase')($scope.routing.formName, true), 1, needDivider);
        }
        $scope.contextMenu = $data.dropDownDisplay || $data.modelNameDisplay || $filter('titleCase')($scope.routing.modelName, false);
      }
    });

    $scope.doClick = function (index, event) {
      var option = angular.element(event.target);
      var item = $scope.items[index];
      if (item.divider || option.parent().hasClass('disabled')) {
        event.preventDefault();
      } else if (item.broadcast) {
        $scope.$broadcast(item.broadcast);
      } else {
        // Performance optimization: http://jsperf.com/apply-vs-call-vs-invoke
        var args = item.args || [],
          fn = item.fn;
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
      }
    };

    $scope.isHidden = function (index) {
      return $scope.items[index].isHidden ? $scope.items[index].isHidden() : false;
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

  }
}
