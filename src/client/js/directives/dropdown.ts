/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.directives {
  export function dropDownItem($compile: angular.ICompileService): angular.IDirective {
    return {
      restrict: "AE",
      replace: true,
      link: function (scope, element) {
        const template =
          '   <a ng-show="choice.text || choice.textFunc" class="dropdown-option" ng-href="{{choice.url || choice.urlFunc()}}" ng-click="doClick($index, $event, choice)">' +
          "    {{ choice.text || choice.textFunc() }}" +
          "   </a>";
        element.replaceWith($compile(template)(scope));
      },
    };
  }

  export function dropDownSubMenu($compile: angular.ICompileService): angular.IDirective {
    return {
      restrict: "AE",
      replace: true,
      link: function (scope: any, element) {
        const parent = element[0].parentElement;
        const template =
          ' <a ng-show="choice.text || choice.textFunc" class="dropdown-option open-sub-menu" data-ng-mouseenter="mouseenter()">' +
          "   {{ choice.text || choice.textFunc() }}" +
          " </a>" +
          // for now, the remainder of this template does not honour RBAC - come back to this if anyone ever reports it
          ' <ul class="uib-dropdown-menu dropdown-menu sub-menu">' +
          `  <li ng-repeat="choice in choice.items" ng-attr-id="{{choice.id}}">` + //  ${itemVisibilityStr} ${itemDisabledStr}
          '   <drop-down-item data-ng-if="::!choice.items"></drop-down-item>' +
          '   <drop-down-sub-menu data-ng-if="::choice.items"></drop-down-sub-menu>' +
          "  </li>" +
          " </ul>";
        const us = $compile(template)(scope);
        element.replaceWith(us);
        scope.mouseenter = function () {
          // generally-speaking, we want the bottom of the sub-menu to line-up with the bottom of its parent menu
          // item.  we could achieve that using css alone, but the problem comes when the sub menu is too tall, and bottom-
          // aligning it like that causes the top of the menu to overflow the navbar (or even higher).
          // so we need to detect that case, and cap the top of the sub-menu at the top of the parent menu.
          // this is harder than it sounds, as the top of the sub menu needs to be expressed (as a negative number)
          // relative to the top of the parent menu item (because that is the closest relative-positioned parent
          // to the submenu, and therefore what it - as an absolutely-positioned element - is expressed in relation to)
          const parentRect = parent.getBoundingClientRect();
          const ourHeight = us[2].getBoundingClientRect().height;
          let offset = ourHeight - 5; // this is the top padding
          if (offset > parentRect.top) {
            offset -= offset - parentRect.top + parentRect.height;
          }
          offset -= parentRect.height;
          us[2].style.top = `-${offset}px`;
        };
      },
    };
  }

  /*@ngInject*/
  export function modelControllerDropdown(
    SecurityService: fng.ISecurityService
  ): angular.IDirective {
    let menuVisibilityStr: string;
    let menuDisabledStr: string;
    let itemVisibilityStr = "isHidden($index)";
    let itemDisabledStr = `ng-class="dropdownClass($index)"`;
    // without a more fundamental re-write, we cannot support "instant" binding here, so we'll fall-back to using
    // the next-best alternative, which is one-time binding
    const oneTimeBinding = formsAngular.elemSecurityFuncBinding !== "normal";
    const bindingStr = oneTimeBinding ? "::" : "";
    if (SecurityService.canDoSecurity("hidden")) {
      menuVisibilityStr = `ng-if="contextMenuId && !contextMenuHidden" ${SecurityService.getHideableAttrs("{{ ::contextMenuId }}")}`;
      if (oneTimeBinding) {
        // because the isHidden(...) logic is highly likely to be model dependent, that cannot be one-time bound.  to
        // be able to combine one-time and regular binding, we'll use ng-if for the one-time bound stuff and ng-hide for the rest
        itemVisibilityStr = `ng-if="::(choice.divider || !isSecurelyHidden(choice.id))" ng-hide="${itemVisibilityStr}"`;
      } else if (formsAngular.elemSecurityFuncBinding === "normal") {
        itemVisibilityStr = `ng-hide="${itemVisibilityStr} || (!choice.divider && isSecurelyHidden(choice.id))"`;
      }
      itemVisibilityStr += ` ${SecurityService.getHideableAttrs("{{ ::choice.id }}")}`;
    } else {
      menuVisibilityStr = "";
      itemVisibilityStr = `ng-hide="${itemVisibilityStr}"`;
    }
    if (SecurityService.canDoSecurity("disabled")) {
      menuDisabledStr = `disableable-link ng-disabled="contextMenuDisabled" ${SecurityService.getDisableableAttrs("{{ ::contextMenuId }}")}`;
      // as ng-class is already being used, we'll add the .disabled class if the menu item is securely disabled using
      // class="{{ }}".  note that we "prevent" a disabled menu item from being clicked by checking for the DISABLED
      // attribute in the doClick(...) function, and aborting if this is found.
      // note that the 'normal' class introduced here might not actually do anything, but for one-time binding to work
      // properly, we need a truthy value
      itemDisabledStr += ` class="{{ ${bindingStr}(!choice.divider && isSecurelyDisabled(choice.id)) ? 'disabled' : 'normal' }}" ${SecurityService.getDisableableAttrs("{{ ::choice.id }}")}`;
    } else {
      menuDisabledStr = "";
    }
    return {
      restrict: "AE",
      replace: true,
      template:
        `<li id="{{ contextMenuId }}" ng-show="items.length > 0" class="mcdd" uib-dropdown ${menuVisibilityStr} ${menuDisabledStr}>` +
        ' <a href="#" id="context-menu-sel" uib-dropdown-toggle>' +
        '  {{contextMenu}} <b class="caret"></b>' +
        " </a>" +
        ' <ul class="uib-dropdown-menu dropdown-menu">' +
        `  <li ng-repeat="choice in items" ng-attr-id="{{choice.id}}" ${itemVisibilityStr} ${itemDisabledStr}>` +
        '   <drop-down-item data-ng-if="!choice.items"></drop-down-item>' +
        '   <drop-down-sub-menu data-ng-if="choice.items"></drop-down-sub-menu>' +
        "  </li>" +
        " </ul>" +
        "</li>",
    };
  }
}
