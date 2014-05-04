describe( 'urlService', function() {

    beforeEach(function () {
        angular.mock.module('formsAngular');

        formsAngular.config(['urlServiceProvider', function (urlServiceProvider) {
            urlServiceProvider.setOptions({html5Mode: false, hashPrefix: '!'});
        }]);
    });

    describe( 'path creation', function() {

        it('should correctly make paths with the correct slashes',
            inject( function (urlService) {
                expect( urlService.path(['a']) ).toBe('/a');
                expect( urlService.path(['a', 'b']) ).toBe('/a/b');
                expect( urlService.path(['abc', 'def']) ).toBe('/abc/def');
                expect( urlService.path(['/abc', 'def']) ).toBe('/abc/def');
                expect( urlService.path(['abc', '/def']) ).toBe('/abc/def');
                expect( urlService.path(['/abc', '/def']) ).toBe('/abc/def');
                expect( urlService.path(['abc/', 'def']) ).toBe('/abc/def');
                expect( urlService.path(['abc', 'def/']) ).toBe('/abc/def');

                expect( urlService.path(['abc/', 'def/']) ).toBe('/abc/def');
                expect( urlService.path(['/abc/', 'def']) ).toBe('/abc/def');
                expect( urlService.path(['abc', '/def/']) ).toBe('/abc/def');
                expect( urlService.path(['/abc/', '/def']) ).toBe('/abc/def');
                expect( urlService.path(['abc/', '/def/']) ).toBe('/abc/def');
                expect( urlService.path(['//abc', 'def']) ).toBe('/abc/def');

                expect( urlService.path(['abc', '//def']) ).toBe('/abc/def');
                expect( urlService.path(['abc//', 'def']) ).toBe('/abc/def');
                expect( urlService.path(['abc', 'def//']) ).toBe('/abc/def');
                expect( urlService.path(['//abc', '//def']) ).toBe('/abc/def');
                expect( urlService.path(['//abc//', 'def']) ).toBe('/abc/def');
                expect( urlService.path(['//abc//', '//def']) ).toBe('/abc/def');
                expect( urlService.path(['//abc//', 'def//']) ).toBe('/abc/def');
                expect( urlService.path(['//abc//', '//def//']) ).toBe('/abc/def');
                expect( urlService.path(['////////////////abc', '////////////////def']) ).toBe('/abc/def');
                expect( urlService.path(['//////////////abc//////////////', '//////////////def///////////////']) ).toBe('/abc/def');
            })
        );

        it('should handle empty elements properly',
            inject( function (urlService) {
                expect( urlService.url(['abc', '', 'def']) ).toBe('#!/abc/def');
                expect( urlService.url(['abc', '', 'def', '', 'g']) ).toBe('#!/abc/def/g');
            })
        );

    });
});