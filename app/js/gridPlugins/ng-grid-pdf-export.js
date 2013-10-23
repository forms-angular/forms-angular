/*
    An early version of this was submitted as a PR to the nggrid project.  This version depends on jspdf having footers
    (which was also submitted as a PR to that project).  If jspdf PR is accepted then we can submit this to nggrid again,
    but that would require putting the totals (ngGridTotalCell.js) into a plugin.
 */

function ngGridPdfExportPlugin (options) {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.services = null;
    self.options = options;

    self.init = function (scope, grid, services) {
        self.grid = grid;
        self.scope = scope;
        self.services = services;

        if (!options.inhibitButton) {
            var fp = grid.$root.find(".ngFooterPanel");
            var pdfDataLinkPrevious = grid.$root.find('.ngFooterPanel .pdf-data-link-span');
            if (pdfDataLinkPrevious != null) {pdfDataLinkPrevious.remove() ; }
            var pdfDataLinkHtml = '<button class="pdf-data-link-span">PDF Export</button>' ;
            fp.append(pdfDataLinkHtml);
            fp.on('click', function() {
                self.createPDF();
            });
        }
    };

    self.createPDF = function () {
        var headers = [],
            data = [],
            footers = {},
            gridWidth = self.scope.totalRowWidth();

        angular.forEach(self.scope.columns, function (col) {
            if (col.visible) {
                headers.push({name: col.field, prompt:col.displayName, width: col.width * (185 / gridWidth), align: (col.colDef.align || 'left')});
                if (col.colDef.totalsRow) {
                    footers[col.field] = self.scope.getTotalVal(col.field, col.filter);
                }
            }
        });

        angular.forEach(self.grid.filteredRows, function (row) {
            data.push(angular.copy(row.entity));
        });

        var doc = new jsPDF();
        doc.cellInitialize();
        doc.table(data, headers, footers, {printHeaders: true, autoSize: false, autoStretch: false});
        doc.output('dataurlnewwindow');
    };
}
