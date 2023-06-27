/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.directives {

  /*@ngInject*/
  export function modelControllerDropdown(SecurityService: fng.ISecurityService): angular.IDirective {
    let menuVisibilityStr: string;
    let menuDisabledStr: string;
    let itemVisibilityStr = "isHidden($index)";
    let itemDisabledStr = `ng-class="dropdownClass($index)"`;
    // without a more fundamental re-write, we cannot support "instant" binding here, so we'll fall-back to using
    // the next-best alternative, which is one-time binding
    const oneTimeBinding = formsAngular.elemSecurityFuncBinding !== "normal";
    const bindingStr = oneTimeBinding ? "::" : "";
    if (SecurityService.canDoSecurity("hidden")) {
      menuVisibilityStr = `ng-if="contextMenuId && !contextMenuHidden" ${SecurityService.getHideableAttrs('{{ ::contextMenuId }}')}`;
      if (oneTimeBinding) {
        // because the isHidden(...) logic is highly likely to be model dependent, that cannot be one-time bound.  to
        // be able to combine one-time and regular binding, we'll use ng-if for the one-time bound stuff and ng-hide for the rest
        itemVisibilityStr = `ng-if="::(choice.divider || !isSecurelyHidden(choice.id))" ng-hide="${itemVisibilityStr}"`;
      } else if (formsAngular.elemSecurityFuncBinding === "normal") {
        itemVisibilityStr = `ng-hide="${itemVisibilityStr} || (!choice.divider && isSecurelyHidden(choice.id))"`;
      }      
      itemVisibilityStr += ` ${SecurityService.getHideableAttrs('{{ ::choice.id }}')}`;
    } else {
      menuVisibilityStr = "";
      itemVisibilityStr = `ng-hide="${itemVisibilityStr}"`;
    }
    if (SecurityService.canDoSecurity("disabled")) {
      menuDisabledStr = `disableable-link ng-disabled="contextMenuDisabled" ${SecurityService.getDisableableAttrs('{{ ::contextMenuId }}')}`;
      // as ng-class is already being used, we'll add the .disabled class if the menu item is securely disabled using
      // class="{{ }}".  note that we "prevent" a disabled menu item from being clicked by checking for the DISABLED
      // attribute in the doClick(...) function, and aborting if this is found.
      // note that the 'normal' class introduced here might not actually do anything, but for one-time binding to work
      // properly, we need a truthy value
      itemDisabledStr += ` class="{{ ${bindingStr}(!choice.divider && isSecurelyDisabled(choice.id)) ? 'disabled' : 'normal' }}" ${SecurityService.getDisableableAttrs('{{ ::choice.id }}')}`;
    } else {
      menuDisabledStr = "";
    }
    return {
      restrict: "AE",
      replace: true,
      template:
        `<li id="{{ contextMenuId }}" ng-show="items.length > 0" class="mcdd" uib-dropdown ${menuVisibilityStr} ${menuDisabledStr}>` +
        ' <a href="#" uib-dropdown-toggle>' +
        '  {{contextMenu}} <b class="caret"></b>' +
        " </a>" +
        ' <ul class="uib-dropdown-menu dropdown-menu">' +
        `  <li ng-repeat="choice in items" ng-attr-id="{{choice.id}}" ${itemVisibilityStr} ${itemDisabledStr}>` +
        '   <a ng-show="choice.text || choice.textFunc" class="dropdown-option" ng-href="{{choice.url || choice.urlFunc()}}" ng-click="doClick($index, $event)">' +
        "    {{ choice.text || choice.textFunc() }}" +
        "   </a>" +
        "  </li>" +
        " </ul>" +
        "</li>",
    };
  }
}
