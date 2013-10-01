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
            var fp = grid.$root.find(".ngFooterPanel");
            var csvDataLinkPrevious = grid.$root.find('.ngFooterPanel .csv-data-link-span');
            if (csvDataLinkPrevious != null) {csvDataLinkPrevious.remove() ; }
            var csvDataLinkHtml = "<span class=\"csv-data-link-span\">";
            csvDataLinkHtml += "<br><a href=\"data:text/csv;charset=UTF-8,";
            csvDataLinkHtml += encodeURIComponent(csvData);
            csvDataLinkHtml += "\" download=\"Export.csv\">CSV Export</a></br></span>" ;
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

formsAngular.controller('AnalysisCtrl', ['$locationParse', '$filter', '$scope', '$http', '$location', '$routeParams', function ($locationParse, $filter, $scope, $http, $location, $routeParams) {
    var debug = false;

    angular.extend($scope, $routeParams);
    $scope.reportSchema = {};
    $scope.gridOptions = {
        columnDefs : 'reportSchema.columnDefs',
        data: 'report',
        showColumnMenu: true,
        showFilter: true,
        enableSorting: false,     // because it puts totals in the list
        plugins: [new ngGridFlexibleHeightPlugin(), new ngGridCsvExportPlugin()],
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

    $scope.getRowClass = function(row) {
        return row.entity.isLast === true ? 'lastRow' : 'notLastRow';
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
                if (data.schema.columnDefs) {
                    var totals = {}
                        , showTotals = false
                        , columnDefs = data.schema.columnDefs;
                    for (var i = 0 ; i < columnDefs.length ; i++) {
                        switch (columnDefs[i].totalsRow) {
                            case undefined :
                                break;
                            case '$SUM' :
                                var sum = 0;
                                for (var j = 0; j < data.report.length ;j++) {
                                    sum += data.report[j][columnDefs[i].field]
                                }
                                totals[columnDefs[i].field] = sum;
                                showTotals = true;
                                break;
                            default :
                                totals[columnDefs[i].field] = columnDefs[i].totalsRow;
                                showTotals = true;
                                break;
                        }
                    }
                    if (showTotals) {
                        data.report.push(totals);
                    }
                }
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


