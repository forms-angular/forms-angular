'use strict';

// A directive in a tab that is only compiled when it is first selected (sharedData.lazyTabs) registers its conversion
// after the record has been initialised and the conversions watcher dropped.  applyLateConversions applies it.
describe('applyLateConversions', function () {

  var scope, ctrlState, $timeout, lookups;

  beforeEach(angular.mock.module('formsAngular'));

  beforeEach(inject(function ($rootScope, _$timeout_, RecordHandlerService) {
    $timeout = _$timeout_;
    scope = $rootScope.$new();
    scope.topLevelFormName = 'myForm';
    scope.formSchema = [
      { name: 'name', id: 'f_name', label: 'Name', type: 'text' },
      { name: 'contact', id: 'f_contact', label: 'Contact', type: 'text' }
    ];
    ctrlState = { master: { name: 'Acme', contact: 'aaaaaaaaaaaaaaaaaaaaaaa1' } };
    scope.record = angular.copy(ctrlState.master);
    scope.setPristine = function () {};
    RecordHandlerService.decorateScope(scope, {}, RecordHandlerService, ctrlState);
    // the conversion callback looks the input up by id selector, which bare jqLite (as loaded by karma) can't do -
    // see nestedConversionsSpec
    var realElement = angular.element;
    spyOn(angular, 'element').and.callFake(function (arg) {
      if (typeof arg === 'string' && arg.charAt(0) === '#') {
        return realElement(document.getElementById(arg.slice(1)) || document.createElement('div'));
      }
      return realElement(arg);
    });
    lookups = 0;
    // registered the way fng-ui-select registers one
    scope.conversions = {
      contact: {
        fngajax: function (value, schemaEntry, callback) {
          lookups++;
          callback(schemaEntry, typeof value === 'string' ? { id: value, text: 'Jo Bloggs' } : value);
        }
      }
    };
  }));

  it('converts the record and the master copy, so cancelling keeps the conversion', function () {
    scope.conversionsModified = true;
    scope.applyLateConversions();
    expect(scope.record.contact).toEqual({ id: 'aaaaaaaaaaaaaaaaaaaaaaa1', text: 'Jo Bloggs' });
    expect(ctrlState.master.contact).toEqual({ id: 'aaaaaaaaaaaaaaaaaaaaaaa1', text: 'Jo Bloggs' });
    scope.record.contact = { id: 'aaaaaaaaaaaaaaaaaaaaaaa2', text: 'Someone Else' };
    scope.cancel();
    $timeout.flush();
    expect(scope.record.contact).toEqual({ id: 'aaaaaaaaaaaaaaaaaaaaaaa1', text: 'Jo Bloggs' });
  });

  // a directive sets conversionsModified on the nearest scope that has a topLevelFormName of its own, which is not
  // this one when the tab's contents are in the same scope as a nested form-input
  it('converts whether or not conversionsModified has been set on the form scope', function () {
    scope.conversionsModified = false;
    scope.applyLateConversions();
    expect(scope.record.contact).toEqual({ id: 'aaaaaaaaaaaaaaaaaaaaaaa1', text: 'Jo Bloggs' });
    expect(ctrlState.master.contact).toEqual({ id: 'aaaaaaaaaaaaaaaaaaaaaaa1', text: 'Jo Bloggs' });
  });

  it('keeps a change the user has already made to the field', function () {
    scope.record.contact = { id: 'aaaaaaaaaaaaaaaaaaaaaaa2', text: 'Someone Else' };
    scope.applyLateConversions();
    expect(scope.record.contact).toEqual({ id: 'aaaaaaaaaaaaaaaaaaaaaaa2', text: 'Someone Else' });
    expect(ctrlState.master.contact).toEqual({ id: 'aaaaaaaaaaaaaaaaaaaaaaa1', text: 'Jo Bloggs' });
  });

  it('leaves it to the conversions watcher while that is still running', function () {
    scope.conversionsModified = true;
    scope.dropConversionWatcher = function () {};
    scope.applyLateConversions();
    expect(lookups).toBe(0);
  });
});
