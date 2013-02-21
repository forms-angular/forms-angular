angular.module('formsAngular.form', [])
    .directive('formInput', function($compile){
        return {
            restrict: 'E',
            replace: true,
            compile: function(){
                return function (scope, element, attrs){
                    scope.$watch(attrs.formInput, function(){
                        var generateInput = function(fieldInfo, modelString, isRequired, idString) {
                            if (!modelString) {
                                if (fieldInfo.name.indexOf('.') != -1 && element[0].outerHTML.indexOf('schema="true"') != -1) {
                                    // Schema handling - need to massage the ngModel and the id
                                    var compoundName = fieldInfo.name,
                                        lastPartStart = compoundName.lastIndexOf('.');
                                    modelString = 'record.'+compoundName.slice(0,lastPartStart)+'.'+scope.$parent.$index+'.'+compoundName.slice(lastPartStart+1);
                                    idString = modelString.replace(/\./g,'-')
                                } else {
                                    modelString = 'record.'+fieldInfo.name;
                                }
                            }
                            var value
                                , requiredStr = (isRequired || fieldInfo.required) ? ' required' : '';
                            if (fieldInfo.type == 'select') {
                                value = '<select ng-model="' + modelString + '" id="' + idString + '">';
                                value += '<option ng-repeat="option in ' + fieldInfo.options + '">{{option}}</option>';
                                value += '</select>';
                            } else if (fieldInfo.type == 'textarea') {
                                value = '<textarea ' + (fieldInfo.rows ? 'rows = "'+ fieldInfo.rows +'" ':'') + 'ng-model="' + modelString + '"' + (idString ? ' id="'+ idString + '"': '') + requiredStr + (fieldInfo.add ? fieldInfo.add : '') + ' />';
                            } else {
                                value = '<input type="' + info.type + '" ng-model="' + modelString + '"' + (idString ? ' id="'+ idString + '"': '') + requiredStr + (fieldInfo.add ? fieldInfo.add : '') + '/>';
                            }
                            if (fieldInfo.helpInline) {
                                value += '<span class="help-inline">' + fieldInfo.helpInline + '</span>';
                            }
                            if (fieldInfo.help) {
                                value += '<span class="help-block">' + fieldInfo.help + '</span>';
                            }
                            return value;
                        };

                        var generateLabel = function(fieldInfo, addButton) {
                            var labelHTML = '';
                            if (fieldInfo.label !== '' || addButton) {
                                labelHTML = '<label class="control-label" for="'+fieldInfo.id+'">'+fieldInfo.label + (addButton || '')+'</label>';
                            }
                            return labelHTML;
                        };

                        var handleField = function(info) {
                            var template = '<div class="control-group">';
                            if (info.schema) {
                                //schemas (which means they are arrays in Mongoose)
                                template += generateLabel(info, ' <i id="add_' + info.id + ' " ng-click="add(this)" class="icon-plus-sign"></i>') +
                                    '<div class="controls" id="' + info.id + 'List" ng-repeat="subDoc in record.' + info.name + '">' +
                                        '<fieldset>'+
                                            '<div class="row">'+
                                                '<div class="span6">'+
                                                    '<form-input ng-repeat="field in formSchema['+ scope.$index +'].schema" info="{{field}}" schema="true"></form-input>'+
                                                '</div>' +
                                                '<div class="span1">'+
                                                    '<i ng-click="remove(this,$index)" class="icon-minus-sign"></i>' +
                                                '</div> '+
                                            '</div>' +
                                        '</fieldset>' +
                                    '</div>';

                            } else {
                                // Handle arrays here
                                if (info.array) {
                                    template += generateLabel(info, ' <i id="add_' + info.id + ' " ng-click="add(this)" class="icon-plus-sign"></i>') +
                                        '<div class="controls" id="' + info.id + 'List" ng-repeat="arrayItem in record.' + info.name + '">' +
                                        generateInput(info, "arrayItem.x", true, null) +
                                        '<i ng-click="remove(this,$index)" class="icon-minus-sign"></i>'+
                                        '</div>';
                                } else {
                                    // Single fields here
                                    template += generateLabel(info) +
                                        '<div class="controls">' +
                                        generateInput(info, null, attrs.required, info.id)+
                                        '</div>';
                                }
                            }
                            template += '</div>';
                            return template;
                        };

                        // without the "if" below I was sometimes getting the inputs repeated
                        //TODO: could presumably to an optimised search using element
                        if ($('#'+attrs.field).length == 0) {
                            var info = JSON.parse(attrs.info);
                            var template = handleField(info);

                            element.replaceWith($compile(template)(scope));
                        }
                    });
                };
            }
        };
    })
    .directive('formButtons', function ($compile) {
        return {
            restrict: 'A',
            compile: function(){
                return function ($scope, $element) {
                    var template = '<div class="btn-group btn-group pull-right">'+
                        '<button id="saveButton" class="btn btn-mini btn-primary form-btn" ng-click="save()" '+
                        'ng-disabled="isSaveDisabled()"><i class="icon-ok"></i> Save</button>' +
                        '<button id="cancelButton" class="btn btn-mini btn-warning form-btn" ng-click="cancel()" ' +
                        'ng-disabled="isCancelDisabled()"><i class="icon-remove"></i> Cancel</button>'+
                        '</div>'+
                        '<div class="btn-group btn-group pull-right">'+
                        '<button id="newButton" class="btn btn-mini btn-success form-btn" ng-click="new()">'+
                        '<i class="icon-plus"></i> New</button>' +
                        '<button id="deleteButton" class="btn btn-mini btn-danger form-btn" ng-click="delete()">' +
                        '<i class="icon-minus"></i> Delete</button>'+
                        '</div>';
                    $element.replaceWith($compile(template)($scope));
                }
            }
        }
    });