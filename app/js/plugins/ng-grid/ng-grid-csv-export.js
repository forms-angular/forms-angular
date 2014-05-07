'use strict';
function ngGridCsvExportPlugin(opts) {
  var self = this;
  self.grid = null;
  self.scope = null;

  self.init = function (scope, grid, services) {

    function doDownloadButton() {
      var fp = angular.element('h1').parent();
      var csvDataLinkPrevious = angular.element('#csv-data-link');
      if (csvDataLinkPrevious != null) {
        csvDataLinkPrevious.remove();
      }
      var csvDataLinkHtml = "<button id=\"csv-data-link\" class=\"btn\"><a href=\"data:text/csv;charset=UTF-8,";
      csvDataLinkHtml += encodeURIComponent(self.prepareCSV());
      csvDataLinkHtml += "\" download=\"Export.csv\">CSV Export</button>";
      fp.append(csvDataLinkHtml);
    }

    self.grid = grid;
    self.scope = scope;

    if (!opts.inhibitButton) {
      setTimeout(doDownloadButton, 0);
      scope.catHashKeys = function () {
        var hash = '';
        for (var idx in scope.renderedRows) {
          hash += scope.renderedRows[idx].$$hashKey;
        }
        return hash;
      };
      scope.$watch('catHashKeys()', doDownloadButton);
    }
  };

  self.createCSV = function () {
    window.open('data:text/csv;charset=UTF-8,' + encodeURIComponent(self.prepareCSV()));
  };

  self.prepareCSV = function () {

    function csvStringify(str) {
      if (str == null) { // we want to catch anything null-ish, hence just == not ===
        return '';
      }
      if (typeof(str) === 'number') {
        return '' + str;
      }
      if (typeof(str) === 'boolean') {
        return (str ? 'TRUE' : 'FALSE');
      }
      if (typeof(str) === 'string') {
        return str.replace(/"/g, '""');
      }

      return JSON.stringify(str).replace(/"/g, '""');
    }

    function swapLastCommaForNewline(str) {
      var newStr = str.substr(0, str.length - 1);
      return newStr + "\n";
    }

    var csvData = '';
    angular.forEach(self.scope.columns, function (col) {
      if (col.visible && (col.width === undefined || col.width > 0)) {
        csvData += '"' + csvStringify(col.displayName) + '",';
      }
    });

    csvData = swapLastCommaForNewline(csvData);

    angular.forEach(self.grid.filteredRows, function (row) {
      angular.forEach(self.scope.columns, function (col) {
        if (col.visible) {
          csvData += '"' + csvStringify(row.entity[col.field]) + '",';
        }
      });
      csvData = swapLastCommaForNewline(csvData);
    });

    return csvData;
  };
}
