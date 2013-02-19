beforeEach(function() {
    this.addMatchers({
        toHaveClass: function(cls) {
            this.message = function() {
                return "Expected '" + angular.mock.dump(this.actual) + "' to have class '" + cls + "'.";
            };

            return this.actual.hasClass(cls);
        }
    });
});
