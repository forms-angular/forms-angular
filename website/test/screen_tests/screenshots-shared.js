module.exports = function(framework, width, height) {

  function waitForPromiseTest(promiseFn, testFn) {
    browser.wait(function () {
      var deferred = protractor.promise.defer();
      promiseFn().then(function (data) {
        deferred.fulfill(testFn(data));
      });
      return deferred.promise;
    });
  }

  describe('shot', function () {

    it('landing page', function() {
      browser.driver.manage().window().setSize(width, height);
      expect(element(by.css('h1')).getText()).toMatch('forms-angular');
    });

    it('a_unadorned_schema', function () {
      browser.setLocation(framework + '/a_unadorned_schema/666a6075b320153869b17599/edit');
      expect($('.header-lhs h4').getText()).toMatch('A Unadorned Schema');
    });

    it('b_enhanced_schema', function () {
      browser.setLocation(framework + '/b_enhanced_schema/519a6075b320153869b155e0/edit');
      expect($('.header-lhs h4').getText()).toMatch('B Enhanced Schema');
      expect($('#cke_f_formattedText').getText()).toMatch('Source');  // Wait for ckEditor
    });

    it('c_subdoc_example', function () {
      browser.setLocation(framework + '/c_subdoc_example/519aaaaab3201fff69b175e0/edit');
      expect($('.header-lhs h4').getText()).toMatch('C Subdoc Example');
    });

    it('d_array_example', function () {
      browser.setLocation(framework + '/d_array_example/51a6182aea4ea77715000005/edit');
      expect($('.header-lhs h4').getText()).toMatch('D Array Example');
    });

    it('e_referencing_another_collection', function () {
      browser.setLocation(framework + '/e_referencing_another_collection/51d1b2ca8c8683571c000005/edit');
      expect($('.header-lhs h4').getText()).toMatch('E Referencing Another Collection');
    });

    it('e_referencing_another_collection-links', function () {
      // don't specify framework here as it isn't supported in fng-routes (but it still works)
      browser.setLocation('/e_referencing_another_collection/links/51d1b2ca8c8683571c000005/edit');
      expect($('body').getText()).toMatch('E Referencing Another Collection');
    });

    it('f_nested_schema', function () {
      browser.setLocation(framework + '/f_nested_schema/51c583d5b5c51226db418f16/edit');
      expect(element.all(by.css('span.select2-chosen')).first().getText()).toMatch('IsAccepted John');
      expect($('.header-lhs h4').getText()).toMatch('F Nested Schema');
    });

    it('g_conditional_field', function () {
      browser.setLocation(framework + '/g_conditional_field/51c583d5b9991226db418f01/edit');
      expect(element.all(by.css('span.select2-chosen')).first().getText()).toMatch('Jones Alan');
      expect($('.header-lhs h4').getText()).toMatch('G Conditional Field');
    });

    it('i_tabbed_form', function () {
      browser.setLocation(framework + '/i_tabbed_form/557104d6d6eae89c4c1a331f/edit');
      expect($('.header-lhs h4').getText()).toMatch('I Tabbed Form');
    });

    it('docs page', function() {
      browser.setLocation('/schemas');
      expect(element(by.css('h1')).getText()).toMatch('Schemas');
    });

    it('report and params', function() {
      browser.setLocation('/analyse/g_conditional_field/totalforonesex');
      expect(element(by.css('.header-lhs h1')).getText()).toMatch('Numbers of Applicants By Sex');
    });

  });

};
