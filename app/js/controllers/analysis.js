function ngGridFlexibleHeightPlugin (opts) {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.init = function (scope, grid, services) {
        self.domUtilityService = services.DomUtilityService;
        self.grid = grid;
        self.scope = scope;
        var recalcHeightForData = function () { setTimeout(innerRecalcForData, 1); };
        var innerRecalcForData = function () {
            var gridId = self.grid.gridId;
            var footerPanelSel = '.' + gridId + ' .ngFooterPanel';
            var extraHeight = self.grid.$topPanel.height() + $(footerPanelSel).height();
            var naturalHeight = self.grid.$canvas.height() + 1;
            if (opts != null) {
                if (opts.minHeight != null && (naturalHeight + extraHeight) < opts.minHeight) {
                    naturalHeight = opts.minHeight - extraHeight - 3;
                }
            }

            var newViewportHeight = naturalHeight + 3;
            if (!self.scope.baseViewportHeight || self.scope.baseViewportHeight !== newViewportHeight) {
                self.grid.$viewport.css('height', newViewportHeight + 'px');
                self.grid.$root.css('height', (newViewportHeight + extraHeight) + 'px');
                self.scope.baseViewportHeight = newViewportHeight;
                self.domUtilityService.UpdateGridLayout(self.scope, self.grid);
            }
        };
        self.scope.catHashKeys = function () {
            var hash = '',
                idx;
            for (idx in self.scope.renderedRows) {
                hash += self.scope.renderedRows[idx].$$hashKey;
            }
            return hash;
        };
        self.scope.$watch('catHashKeys()', innerRecalcForData);
        self.scope.$watch(self.grid.config.data, recalcHeightForData);
    };
}

function ngGridCsvExportPlugin (opts) {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.init = function(scope, grid, services) {
        self.grid = grid;
        self.scope = scope;
        function showDs() {
            var keys = [];
            for (var f in grid.config.columnDefs) { keys.push(grid.config.columnDefs[f].field);}
            var csvData = '';
            function csvStringify(str) {
                if (str == null) { // we want to catch anything null-ish, hence just == not ===
                    return '';
                }
                if (typeof(str) === 'number') {
                    return '' + str;
                }
                if (typeof(str) === 'boolean') {
                    return (str ? 'TRUE' : 'FALSE') ;
                }
                if (typeof(str) === 'string') {
                    return str.replace(/"/g,'""');
                }

                return JSON.stringify(str).replace(/"/g,'""');
            }
            function swapLastCommaForNewline(str) {
                var newStr = str.substr(0,str.length - 1);
                return newStr + "\n";
            }
            for (var k in keys) {
                csvData += '"' + csvStringify(keys[k]) + '",';
            }
            csvData = swapLastCommaForNewline(csvData);
            var gridData = grid.data;
            for (var gridRow in gridData) {
                for ( k in keys) {
                    var curCellRaw;
                    if (opts != null && opts.columnOverrides != null && opts.columnOverrides[keys[k]] != null) {
                        curCellRaw = opts.columnOverrides[keys[k]](gridData[gridRow][keys[k]]);
                    }
                    else {
                        curCellRaw = gridData[gridRow][keys[k]];
                    }
                    csvData += '"' + csvStringify(curCellRaw) + '",';
                }
                csvData = swapLastCommaForNewline(csvData);
            }
            var fp = angular.element('h1').parent();
            var csvDataLinkPrevious = angular.element('#csv-data-link');
            if (csvDataLinkPrevious != null) {csvDataLinkPrevious.remove() ; }
            var csvDataLinkHtml = "<button id=\"csv-data-link\" class=\"btn\"><a href=\"data:text/csv;charset=UTF-8,";
            csvDataLinkHtml += encodeURIComponent(csvData);
            csvDataLinkHtml += "\" download=\"Export.csv\">CSV Export</button>" ;
            fp.append(csvDataLinkHtml);
        }
        setTimeout(showDs, 0);
        scope.catHashKeys = function() {
            var hash = '';
            for (var idx in scope.renderedRows) {
                hash += scope.renderedRows[idx].$$hashKey;
            }
            return hash;
        };
        scope.$watch('catHashKeys()', showDs);
    };
}

var COL_FIELD = /COL_FIELD/g
formsAngular.directive('ngTotalCell', ['$compile', '$domUtilityService', function ($compile, domUtilityService) {
    var ngCell = {
        scope: false,
        compile: function() {
            return {
                pre: function($scope, iElement) {
                    var html;
// ellText" ng-class="col.colIndex()"><span ng-cell-text>{{COL_FIELD |number}}</s
// ellText" ng-class="col.colIndex()"><span ng-cell-text>{{COL_FIELD }}</s
                    var cellTemplate,
                        filterMatch = $scope.col.cellTemplate.match(/{{COL_FIELD \|(.+)}}/);
                    if (filterMatch) {
                        cellTemplate = $scope.col.cellTemplate.replace('COL_FIELD |' + filterMatch[1], 'getTotalVal("' + $scope.col.field + '","' + filterMatch[1] + '")');
                    } else {
                        cellTemplate = $scope.col.cellTemplate.replace(COL_FIELD, 'getTotalVal("' + $scope.col.field + '")');
                    }

                    if ($scope.col.enableCellEdit) {
                        html =  $scope.col.cellEditTemplate;
                        html = html.replace(DISPLAY_CELL_TEMPLATE, cellTemplate);
                        html = html.replace(EDITABLE_CELL_TEMPLATE, $scope.col.editableCellTemplate.replace(COL_FIELD, 'row.entity.' + $scope.col.field));
                    } else {
                        html = cellTemplate;
                    }

                    var cellElement = $compile(html)($scope);

                    if ($scope.enableCellSelection && cellElement[0].className.indexOf('ngSelectionCell') === -1) {
                        cellElement[0].setAttribute('tabindex', 0);
                        cellElement.addClass('ngCellElement');
                    }

                    iElement.append(cellElement);
                },
                post: function($scope, iElement) {
                    if ($scope.enableCellSelection) {
                        $scope.domAccessProvider.selectionHandlers($scope, iElement);
                    }

                    $scope.$on('ngGridEventDigestCell', function() {
                        domUtilityService.digest($scope);
                    });
                }
            };
        }
    };

    return ngCell;
}]);

formsAngular.controller('AnalysisCtrl', ['$locationParse', '$filter', '$scope', '$http', '$location', '$routeParams', function ($locationParse, $filter, $scope, $http, $location, $routeParams) {
    var debug = false;

    angular.extend($scope, $routeParams);
    $scope.reportSchema = {};
    $scope.gridOptions = {
        columnDefs : 'reportSchema.columnDefs',
        data: 'report',
        showColumnMenu: true,
        showFilter: true,
        showFooter: true,
        showTotals: true,
        footerRowHeight: 65,
        multiSelect: false,
        plugins: [], //new ngGridFlexibleHeightPlugin(), new ngGridCsvExportPlugin()],
        footerTemplate:
'<div ng-show="showFooter" class="ngFooterPanel" ng-class="{\'ui-widget-content\': jqueryUITheme, \'ui-corner-bottom\': jqueryUITheme}" ng-style="footerStyle()">'+
 '<div ng-show="gridOptions.showTotals" ng-style="{height: rowHeight+3}">'+
  '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell ngTotalCell {{col.cellClass}}">' +
   '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
   '<div ng-total-cell></div>' +
 ' </div>' +
 '</div>' +
 '<div class="ngTotalSelectContainer" >'+
  '<div class="ngFooterTotalItems" ng-class="{\'ngNoMultiSelect\': !multiSelect}" >'+
   '<span class="ngLabel">{{i18n.ngTotalItemsLabel}} {{maxRows()}}</span><span ng-show="filterText.length > 0" class="ngLabel">({{i18n.ngShowingItemsLabel}} {{totalFilteredItemsLength()}}) hello</span>'+
  '</div>'+
  '<div class="ngFooterSelectedItems" ng-show="multiSelect">'+
 '  <span class="ngLabel">{{i18n.ngSelectedItemsLabel}} {{selectedItems.length}}</span>'+
  '</div>'+
 '</div>'+
 '<div class="ngPagerContainer" style="float: right; margin-top: 10px;" ng-show="enablePaging" ng-class="{\'ngNoMultiSelect\': !multiSelect}">'+
  '<div style="float:left; margin-right: 10px;" class="ngRowCountPicker">'+
   '<span style="float: left; margin-top: 3px;" class="ngLabel">{{i18n.ngPageSizeLabel}}</span>'+
   '<select style="float: left;height: 27px; width: 100px" ng-model="pagingOptions.pageSize" >'+
    '<option ng-repeat="size in pagingOptions.pageSizes">{{size}}</option>'+
   '</select>'+
  '</div>'+
  '<div style="float:left; margin-right: 10px; line-height:25px;" class="ngPagerControl" style="float: left; min-width: 135px;">'+
   '<button class="ngPagerButton" ng-click="pageToFirst()" ng-disabled="cantPageBackward()" title="{{i18n.ngPagerFirstTitle}}"><div class="ngPagerFirstTriangle"><div class="ngPagerFirstBar"></div></div></button>'+
   '<button class="ngPagerButton" ng-click="pageBackward()" ng-disabled="cantPageBackward()" title="{{i18n.ngPagerPrevTitle}}"><div class="ngPagerFirstTriangle ngPagerPrevTriangle"></div></button>'+
   '<input class="ngPagerCurrent" min="1" max="{{maxPages()}}" type="number" style="width:50px; height: 24px; margin-top: 1px; padding: 0 4px;" ng-model="pagingOptions.currentPage"/>'+
   '<button class="ngPagerButton" ng-click="pageForward()" ng-disabled="cantPageForward()" title="{{i18n.ngPagerNextTitle}}"><div class="ngPagerLastTriangle ngPagerNextTriangle"></div></button>'+
   '<button class="ngPagerButton" ng-click="pageToLast()" ng-disabled="cantPageToLast()" title="{{i18n.ngPagerLastTitle}}"><div class="ngPagerLastTriangle"><div class="ngPagerLastBar"></div></div></button>'+
  '</div>'+
 '</div>'+
'</div>'
    };
    $scope.report = [];

    if (!$scope.reportSchemaName && $routeParams.r) {
        switch ($routeParams.r.slice(0, 1)) {
            case '[' :
                $scope.reportSchema.pipeline = JSON.parse($routeParams.r);
                break;
            case '{' :
                angular.extend($scope.reportSchema, JSON.parse($routeParams.r));
                break;
            default :
                throw new Error("No report instructions specified");
        }
    }

    $scope.getTotalVal = function(field, filter) {
        var result = '',
            instructions = _.find($scope.reportSchema.columnDefs,function(col) {
                return col.field === field;
            });

        if (instructions) {
            switch (instructions.totalsRow) {
                case undefined :
                    break;
                case '$SUM' :
                    var sum = 0;
                    for (var j = 0; j < $scope.report.length ;j++) {
                        sum += $scope.report[j][field]
                    }
                    result = sum;
                    break;
                default :
                    result = instructions.totalsRow;
                    break;
            }
        }

        if (filter) {
            result = $filter(filter)(result);
        }
        return result;
    }

    $scope.refreshQuery = function() {

        var apiCall = '/api/report/' + $scope.model
            ,connector;
        if ($scope.reportSchemaName) {
            apiCall += '/'+$scope.reportSchemaName
            connector = '?'
        } else {
            apiCall += '?r=' + JSON.stringify($scope.reportSchema);
            connector = '&'
        }

        if ($scope.paramSchema) {
            // we are using the params form
            for (var paramVal in $scope.record) {
                var instructions = $scope.reportSchema.params[paramVal];
                if ($scope.record[paramVal] && $scope.record[paramVal] !== "") {
                    $scope.param = $scope.record[paramVal];
                    if (instructions.conversionExpression) {
                        $scope.param = $scope.$eval(instructions.conversionExpression);
                    }
                    apiCall += connector + paramVal + '=' + $scope.param;
                    connector = '&';
                } else if (instructions.required) {
                    // Don't do a round trip if a required field is empty - it will show up red
                    return;
                }
            }
        } else {
            // take params of the URL
            var query = $location.$$url.match(/\?.*/);
            if (query) {
                apiCall += connector + query[0].slice(1)
            }
        }

        $http.get(apiCall).success(function (data) {
            if (data.success) {
                $scope.report = data.report;
                $scope.reportSchema = data.schema;
                $scope.reportSchema.title = $scope.reportSchema.title || $scope.model;
                // set up parameters if this is the first time through
                if (!$scope.paramSchema && data.schema.params) {
                    $scope.paramSchema = [];
                    $scope.record = {};
                    for (var param in data.schema.params) {
                        var thisPart = data.schema.params[param];
                        // if noInput then this value will be inferred from another parameter
                        if (!thisPart.noInput) {
                            var newLen = $scope.paramSchema.push({
                                name: param,
                                id: 'fp_'+param,
                                label: thisPart.label || $filter('titleCase')(param),
                                type : thisPart.type || 'text',
                                required: true,
                                size: thisPart.size || 'small'
                            });
                            if (thisPart.type === 'select') {
                                // TODO: Remove when select and select2 is modified during the restructure
                                $scope[param + '_Opts'] = thisPart.enum;
                                $scope.paramSchema[newLen-1].options = param + '_Opts';
                            }
                        }
                        $scope.record[param] = thisPart.value;
                    }
                    $scope.$watch('record', function (newValue, oldValue) {
                        if (oldValue !== newValue) {
                            $scope.refreshQuery();
                        }
                    },true);

                }
            } else {
                console.log(JSON.stringify(data));
                $scope.reportSchema.title = "Error - see console log";
            }
        }).error(function (err) {
                console.log(JSON.stringify(err));
                $location.path("/404");
             });
    }

    $scope.refreshQuery();

}]);


