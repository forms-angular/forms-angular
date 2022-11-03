/// <reference path="../../../../node_modules/@types/angular/index.d.ts" />

module fng.services {
  /*@ngInject*/
  export function securityService($rootScope): fng.ISecurityService {
    function canDoSecurity(): boolean {
      return !!formsAngular.elemSecurityFuncBinding && !!formsAngular.elemSecurityFuncName;
    }

    function canDoSecurityNow(): boolean {
      return canDoSecurity() && $rootScope[formsAngular.elemSecurityFuncName];
    }

    function isSecurelyHidden(elemId: string, pseudoUrl?: string) {
      return $rootScope[formsAngular.elemSecurityFuncName](elemId, "hidden", pseudoUrl);
    };

    function isSecurelyDisabled(elemId: string, pseudoUrl?: string) {
      return $rootScope[formsAngular.elemSecurityFuncName](elemId, "disabled", pseudoUrl);
    };

    return {
      canDoSecurity,

      canDoSecurityNow,

      isSecurelyHidden,

      isSecurelyDisabled,

      decorateFormScope: function (formScope: fng.IFormScope, pseudoUrl?: string): void {
        if (canDoSecurity()) {
          formScope.isSecurelyHidden = function (elemId: string) {
            return isSecurelyHidden(elemId, pseudoUrl); 
          }
          formScope.isSecurelyDisabled = function (elemId: string) {
            return isSecurelyDisabled(elemId, pseudoUrl);
          }
        }
      },

      doSecurityWhenReady: function (cb: () => void): void {
        if (canDoSecurityNow()) {
          cb();
        } else if (canDoSecurity()) {
          // wait until elemSecurityFunc has been provided (externally) before proceeding with the callback...
          const unwatch = $rootScope.$watch(formsAngular.elemSecurityFuncName, (newValue) => {
            if (newValue) {
              unwatch();
              cb();
            }
          })
        }
      }
    };
  }
}
