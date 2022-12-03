/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.services {
  /*@ngInject*/
  export function securityService($rootScope: angular.IRootScopeService): fng.ISecurityService {
    function canDoSecurity(type: SecurityType): boolean {
      return (
        !!formsAngular.elemSecurityFuncBinding &&
        (
          (type === "hidden" && !!formsAngular.hiddenSecurityFuncName) ||
          (type === "disabled" && !!formsAngular.disabledSecurityFuncName)
        )
      );
    }

    function canDoSecurityNow(scope: fng.ISecurableScope, type: SecurityType): boolean {
      return (
        canDoSecurity(type) && // we have security configured
        (
          // the host app has not (temporarily) disabled this security type (which it might do, as an optimisation, when there are
          // currently no security rules to apply); and 
          // it has provided the callbacks that are specified in the security configuration; and
          // the provided scope (if any) has been decorated (by us).  pages and popups which aren't form controllers will need to use
          // (either directly, or through formMarkupHelper), the decorateSecurableScope() function below
          (
            type === "hidden" &&
            $rootScope[formsAngular.hiddenSecurityFuncName] && 
            (!scope || !!scope.isSecurelyHidden)
          )
          ||
          (
            type === "disabled" &&
            $rootScope[formsAngular.disabledSecurityFuncName] &&
            (!scope || !!scope.isSecurelyDisabled)
          )
        )
      )
    }

    function isSecurelyHidden(elemId: string, pseudoUrl?: string): boolean {
      return $rootScope[formsAngular.hiddenSecurityFuncName](elemId, pseudoUrl);
    }

    function getSecureDisabledState(elemId: string, pseudoUrl?: string): fng.DisabledOutcome {
      return $rootScope[formsAngular.disabledSecurityFuncName](elemId, pseudoUrl);
    }

    function isSecurelyDisabled(elemId: string, pseudoUrl?: string): boolean {
      return !!getSecureDisabledState(elemId, pseudoUrl); // either true or "+"
    }

    function getBindingStr(): string {
      return formsAngular.elemSecurityFuncBinding === "one-time" ? "::" : "";
    }

    function ignoreElemId(elemId: string): boolean {
      return fng.formsAngular.ignoreIdsForHideableOrDisableableAttrs?.some((id) => elemId.includes(id));
    }

    function getXableAttrs(elemId: string, attr: string): string {
      if (elemId && attr && !ignoreElemId(elemId)) {
        return ` ${attr} title="${elemId}"`;
      } else {
        return "";
      }
    }

    function getDisableableAttrs(elemId: string): string {
      // even when an element should not actually be disabled, we should still mark what would otherwise have been a
      // potentially-disabled element with scope.disableableAttr - where this is set - and where it is set, also set its
      // title to be the same as its id so that users can learn of its id by hovering over it.  this will
      // help anyone trying to figure out what is the right element id to use for a DOM security rule
      return getXableAttrs(elemId, fng.formsAngular.disableableAttr);
    }

    function getDisableableAncestorAttrs(elemId: string): string {
      // even when an element should not actually be disabled, we should still mark what would otherwise have been a
      // potentially-disabled element with scope.disableableAttr - where this is set - and where it is set, also set its
      // title to be the same as its id so that users can learn of its id by hovering over it.  this will
      // help anyone trying to figure out what is the right element id to use for a DOM security rule
      return getXableAttrs(elemId, fng.formsAngular.disableableAncestorAttr);
    }

    function getHideableAttrs(elemId: string): string {
      // even when canDoSecurityNow() returns false, we should still mark what would otherwise have been a
      // potentially-hidden element with scope.hideableAttr, where this is set, and where it is set, also set its
      // title to be the same as its id so that users can learn of its id by hovering over it.  this will
      // help anyone trying to figure out what is the right element id to use for a DOM security rule
      return getXableAttrs(elemId, fng.formsAngular.hideableAttr);
    }

    return {
      canDoSecurity,

      canDoSecurityNow,

      isSecurelyHidden,

      isSecurelyDisabled,

      getHideableAttrs,

      getDisableableAttrs,

      getDisableableAncestorAttrs,

      // whilst initialising new pages and popups, pass their scope here for decoration with functions that can be used to check
      // the disabled / hidden state of DOM elements on that page according to the prevailing security rules.
      // if the host app indicates that security checks should be skipped for this page, we will NOT assign the corresponding
      // functions.  the presence of these functions will be checked later by canDoSecurityNow(), which will always be called
      // before any security logic is applied.  this allows security to be bypassed entirely at the request of the host app,
      // providing an opportunity for optimisation.
      decorateSecurableScope: function (securableScope: fng.ISecurableScope, params?: { pseudoUrl?: string, overrideSkipping: boolean }): void {
        if (canDoSecurity("hidden") && (!formsAngular.skipHiddenSecurityFuncName || params?.overrideSkipping || !$rootScope[formsAngular.skipHiddenSecurityFuncName](params?.pseudoUrl))) {
          securableScope.isSecurelyHidden = function (elemId: string): boolean {
            return isSecurelyHidden(elemId, params?.pseudoUrl);
          };
        }
        if (canDoSecurity("disabled") && (!formsAngular.skipDisabledSecurityFuncName || params?.overrideSkipping || !$rootScope[formsAngular.skipDisabledSecurityFuncName](params?.pseudoUrl))) {
          securableScope.isSecurelyDisabled = function (elemId: string): boolean {
            return isSecurelyDisabled(elemId, params?.pseudoUrl);
          };
          if (!formsAngular.skipDisabledAncestorSecurityFuncName || params?.overrideSkipping || !$rootScope[formsAngular.skipDisabledAncestorSecurityFuncName](params?.pseudoUrl)) {
            securableScope.requiresDisabledChildren = function (elemId: string): boolean {
              return getSecureDisabledState(elemId, params?.pseudoUrl) === "+";
            };
          }
        }
      },

      doSecurityWhenReady: function (cb: () => void): void {
        if (canDoSecurityNow(undefined, "hidden")) {
          cb();
        } else if (canDoSecurity("hidden")) {
          // wait until the hidden security function has been provided (externally) before proceeding with the callback...
          // we assume here that the hidden security and disabled security functions are both going to be provided at the
          // same time (and could therefore watch for either of these things)
          const unwatch = $rootScope.$watch(formsAngular.hiddenSecurityFuncName, (newValue) => {
            if (newValue) {
              unwatch();
              cb();
            }
          });
        }
      },

      considerVisibility: function (id: string, scope: fng.ISecurableScope): fng.ISecurityVisibility {
        const hideableAttrs = getHideableAttrs(id);
        if (canDoSecurityNow(scope, "hidden")) {
          if (formsAngular.elemSecurityFuncBinding === "instant") {
            if (scope.isSecurelyHidden(id)) {
              // if our securityFunc supports instant binding and evaluates to true, then nothing needs to be
              // added to the dom for this field, which we indicate to our caller as follows...
              return { omit: true };
            }
          } else {
            return { visibilityAttr: `data-ng-if="${getBindingStr()}!isSecurelyHidden('${id}')"${hideableAttrs}` };
          }
        }
        return { visibilityAttr: hideableAttrs };
      },

      // consider the visibility of a container whose visibility depends upon at least some of its content being visible.
      // the container is assumed not to itself be securable (hence it doesn't have an id - or at least, not one we're
      // concerned about - and it doesn't itself need a "hideable" attribute) 
      considerContainerVisibility: function (contentIds: string[], scope: fng.ISecurableScope): fng.ISecurityVisibility {
        if (canDoSecurityNow(scope, "hidden")) {
          if (formsAngular.elemSecurityFuncBinding === "instant") {
            if (contentIds.some((id) => !scope.isSecurelyHidden(id))) {
              return {};
            } else {
              return { omit: true };
            }
          } else {
            const attrs = contentIds.map((id) => `!isSecurelyHidden('${id}')`);
            return { visibilityAttr: `data-ng-if="${getBindingStr()}(${attrs.join(" || ")})"` };
          }
        }
        return {};
      },

      // Generate an attribute that could be added to the element with the given id to enable or disable it
      // according to the prevailing security rules.  In most cases, the attribute will either be "disabled"
      // (in the case of 'instant' binding) or data-ng-disabled="xxxx" (in the case of one-time or normal
      // binding).  For directives that require something different, use params:
      //  - forceNg will wrap a positive (disabled) result in an angular directive (e.g., data-ng-disabled="true")
      //    rather than returning simply "disabled"
      //  - attrRequiresValue will translate a positive (disabled) result into an attribute with a truthy value
      //    (e.g., disabled="true") rather than returning simply "disabled"
      //  - attr can be used in the case where a directive expects an attribute other than "disabled".
      //    (for example, uib-tab expects "disable").
      // Even if the element is not be disabled on this occasion, we will always return the value of
      // fng.formsAngular.disableableAttr - where set - as a way of marking it as potentially disableable.
      // Because they can also have a readonly attribute which needs to be taken into consideration, this
      // function is NOT suitable for fields, which are instead handled by fieldformMarkupHelper.handleReadOnlyDisabled().
      generateDisabledAttr: function (id: string, scope: fng.ISecurableScope, params?: IGenerateDisableAttrParams): string {
        function getActuallyDisabledAttrs(): string {
          let result = "";
          if (canDoSecurityNow(scope, "disabled")) {
            if (!params) {
              params = {};
            }
            if (params.attrRequiresValue && params.forceNg) {
              throw new Error(
                "Invalid combination of parameters provided to generateDisabledAttr() [attrRequiresValue and forceNg]"
              );
            }
            let attr = params.attr || "disabled";
            if (formsAngular.elemSecurityFuncBinding === "instant") {
              if (scope.isSecurelyDisabled(id)) {
                if (params.attrRequiresValue) {
                  return ` ${attr}="true"`;
                } else if (params.forceNg) {
                  result = "true";
                } else {
                  return ` ${attr}`;
                }
              }
            } else {
              result = `${getBindingStr()}isSecurelyDisabled('${id}')`;
            }
            if (result) {
              if (attr === "disabled") {
                return ` data-ng-disabled="${result}"`;
              } else {
                return ` data-ng-attr-${attr}="${result}"`;
              }
            }
          }
          return result;
        }
        return getActuallyDisabledAttrs() + getDisableableAttrs(id);
      },
    };
  }
}
