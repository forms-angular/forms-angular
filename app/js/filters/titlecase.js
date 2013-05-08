angular.module('titleCaseFilter',[]).filter('titleCase',function() {
    return function(str) {
        return str.replace(/_/g, ' ').replace(/[A-Z]/g, ' $&').replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
});