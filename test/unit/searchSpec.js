describe('search', function () {

    var scope, $httpBackend;

    beforeEach(angular.mock.module('formsAngular'));

    beforeEach(inject(function (_$httpBackend_, $rootScope, $compile) {
        $httpBackend = _$httpBackend_;
        elm = angular.element('<div><global-search class="global-search"></global-search></div>');
        scope = $rootScope;
        $compile(elm)(scope);
        scope.$digest();
    }));

    describe('form generation', function () {

        it('should have a search form', function () {
            var form = elm.find('form');
            expect(form).toHaveClass('navbar-search');
        });

        it('should not have an error class in the search box when the form is created', function () {
            var div = elm.find('div:first');
            expect(div.attr('id')).toBe('search-cg');
            expect(div.attr('class')).toBe('control-group');
        });

    });

    describe('results list', function() {

        it('displays one result when there is one', function() {
            $httpBackend.whenGET('api/search?q=hello').respond({results:[{id:'1',resource:'resource',resourceText:'Resource',text:'Hello 1'}]});
            scope.searchTarget = 'hello';
            scope.$digest();
            $httpBackend.flush();
            var results = elm.find('span');
            expect(results.length).toBe(1);
        });

        it('displays two results when there are two', function() {
            $httpBackend.whenGET('api/search?q=hello').respond({results:[{id:'1',resource:'resource',resourceText:'Resource',text:'Hello 1'},{id:'2',resource:'resource',resourceText:'Resource',text:'Hello 2'}]});
            scope.searchTarget = 'hello';
            scope.$digest();
            $httpBackend.flush();
            var results = elm.find('span');
            expect(results.length).toBe(2);
            var div = elm.find('div:first');
            expect(div.attr('class')).toBe('control-group');
        });

        it('should have an error class in the search box when the string is not found', function () {
            $httpBackend.whenGET('api/search?q=hello').respond({results:[]});
            scope.searchTarget = 'hello';
            scope.$digest();
            $httpBackend.flush();
            var results = elm.find('span');
            expect(results.length).toBe(0);
            var div = elm.find('div:first');
            expect(div.attr('class')).toBe('control-group error');
            scope.searchTarget = '';
            scope.$digest();
            expect(div.attr('class')).toBe('control-group');
        });

        it('should have an error class in the search box when the string is not found', function () {
            $httpBackend.whenGET('api/search?q=hello').respond({"results":[{"resource":"f_nested_schema","resourceText":"Exams","id":"51c583d5b5c51226db418f15","text":"Brown, John","searchImportance":99},{"resource":"f_nested_schema","resourceText":"Exams","id":"51c583d5b5c51226db418f17","text":"Brown, Jenny","searchImportance":99}],"moreCount":0});
            scope.searchTarget = 'hello';
            scope.$digest();
            $httpBackend.flush();
            var results = elm.find('span');
            expect(results.length).toBe(2);
            results = elm.find('span:first');
            expect(results.text()).toMatch('Exams');
            expect(results.text()).toMatch('Brown, ');
            expect(results.text()).toMatch('John');
        });

    });


});