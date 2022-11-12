/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.services {
  /*@ngInject*/
  export function securityService($rootScope): fng.ISecurityService {
    function canDoSecurity(): boolean {
      return (
        !!formsAngular.elemSecurityFuncBinding &&
        !!formsAngular.hiddenSecurityFuncName &&
        !!formsAngular.disabledSecurityFuncName
      );
    }

    function canDoSecurityNow(scope: fng.IFormScope): boolean {
      return (
        canDoSecurity() && // we have security configured
        $rootScope[formsAngular.hiddenSecurityFuncName] && // the host app has provided the security callbacks that are specified in that configuration
        $rootScope[formsAngular.disabledSecurityFuncName] && 
        (!scope || (!!scope.isSecurelyDisabled && !!scope.isSecurelyHidden)) // the provided scope (if any) has been decorated (by us).  pages and popups which aren't form controllers will need to use (either directly, or through formMarkupHelper, the decorateFormScope() function below)
      );
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

    return {
      canDoSecurity,

      canDoSecurityNow,

      isSecurelyHidden,

      isSecurelyDisabled,

      decorateFormScope: function (formScope: fng.IFormScope, pseudoUrl?: string): void {
        if (canDoSecurity()) {
          formScope.isSecurelyHidden = function (elemId: string): boolean {
            return isSecurelyHidden(elemId, pseudoUrl);
          };
          formScope.isSecurelyDisabled = function (elemId: string): boolean {
            return isSecurelyDisabled(elemId, pseudoUrl);
          };
          formScope.requiresDisabledChildren = function (elemId: string): boolean {
            return getSecureDisabledState(elemId, pseudoUrl) === "+";
          };
        }
      },

      doSecurityWhenReady: function (cb: () => void): void {
        if (canDoSecurityNow(undefined)) {
          cb();
        } else if (canDoSecurity()) {
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

      considerVisibility: function (id: string, scope: fng.IFormScope): fng.ISecurityVisibility {
        if (canDoSecurityNow(scope)) {
          if (formsAngular.elemSecurityFuncBinding === "instant") {
            if (scope.isSecurelyHidden(id)) {
              // if our securityFunc supports instant binding and evaluates to true, then nothing needs to be
              // added to the dom for this field, which we indicate to our caller as follows...
              return { omit: true };
            }
          } else {
            return { visibilityAttr: `data-ng-if="${getBindingStr()}!isSecurelyHidden('${id}')"` };
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
      // Because they can also have a readonly attribute which needs to be taken into consideration, this
      // function is NOT suitable for fields, which are instead handled by fieldformMarkupHelper.handleReadOnlyDisabled().
      generateDisabledAttr: function (id: string, scope: fng.IFormScope, params?: IGenerateDisableAttrParams): string {
        let result = "";
        if (canDoSecurityNow(scope)) {
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
      },
    };
  }
}
