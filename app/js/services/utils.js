formsAngular.service('utils', function() {


    this.getAddAllGroupOptions = function (scope, attrs) {
        return getAddAllOptions(scope, attrs, "Group");
    }

    this.getAddAllFieldOptions = function (scope, attrs) {
        return getAddAllOptions(scope, attrs, "Field");
    }

    this.getAddAllLabelOptions = function (scope, attrs) {
        return getAddAllOptions(scope, attrs, "Label");
    }



     function getAddAllOptions (scope, attrs, type) {

        type = "addAll" + type;

        var addAllOptions = [];

        function getAllOptions(obj) {

            for (var key in obj) {
                if (key === type) {
                    addAllOptions.push (obj[key]);
                }

                if (key === "$parent") {
                    getAllOptions(obj[key]);
                }
            }

        }

        getAllOptions(scope);

        if (attrs[type] !== undefined) {

            if (typeof(attrs[type]) === "object") {

                //support objects...

            } else if (typeof (attrs[type]) === "string") {

                addAllOptions.push(attrs[type].trim());


            } else {
                // return false; //error?
            }
        }

        return addAllOptions.length > 0 ? " " + addAllOptions.join(" ") + " " : " ";
    }
});