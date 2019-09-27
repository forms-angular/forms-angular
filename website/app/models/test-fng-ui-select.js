"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var TestFngUiSelectSchemaDef = {
    surname: { type: String, list: {} },
    forename: { type: String, list: true },
    derivedText: { type: String, required: true, form: { directive: "fng-ui-select", fngUiSelect: { theme: "bootstrap", deriveOptions: "getDerivedText" } } },
    derivedObj: { type: String, required: true, form: { directive: "fng-ui-select", fngUiSelect: { theme: "bootstrap", deriveOptions: "getDerivedObj" } } },
    singleCached: { type: mongoose_1.Schema.Types.ObjectId, ref: 'b_enhanced_schema', form: { directive: 'fng-ui-select' } },
    singleAjax: { type: mongoose_1.Schema.Types.ObjectId, ref: 'b_enhanced_schema', form: { directive: 'fng-ui-select', fngUiSelect: { fngAjax: true } } },
    multiOutsideCached: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'f_nested_schema', form: { directive: 'fng-ui-select', size: 'xxlarge' } }],
    multiInsideCached: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'f_nested_schema', form: { directive: 'fng-ui-select', size: 'xxlarge' } },
    multiOutsideAjax: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'f_nested_schema', form: { directive: 'fng-ui-select', size: 'xxlarge', fngUiSelect: { fngAjax: true } } }],
    multiInsideAjax: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'f_nested_schema', form: { directive: 'fng-ui-select', size: 'xxlarge', fngUiSelect: { fngAjax: true } } },
    multipleOutsideCached: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'f_nested_schema', form: { directive: 'fng-ui-select', size: 'xxlarge', fngUiSelect: { forceMultiple: true }, label: 'Multiple Out. Cached' } }],
    multipleInsideCached: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'f_nested_schema', form: { directive: 'fng-ui-select', size: 'xxlarge', fngUiSelect: { forceMultiple: true }, label: 'Multiple In. Cached' } },
    multipleOutsideAjax: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'f_nested_schema', form: { directive: 'fng-ui-select', size: 'xxlarge', fngUiSelect: { fngAjax: true }, label: 'Multiple Out. Ajax' } }],
    multipleInsideAjax: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'f_nested_schema', form: { directive: 'fng-ui-select', size: 'xxlarge', fngUiSelect: { fngAjax: true }, label: 'Multiple In. Ajax' } },
    filteredAjax: { type: mongoose_1.Schema.Types.ObjectId, ref: 'b_enhanced_schema', form: { directive: 'fng-ui-select', fngUiSelect: { fngAjax: escape(JSON.stringify({ interviewScore: { $gt: 90 } })) } } }
};
var TestFngUiSelectSchema = new mongoose_1.Schema(TestFngUiSelectSchemaDef);
var E;
try {
    E = mongoose_1.model('test_fng_ui_select');
}
catch (e) {
    E = mongoose_1.model('test_fng_ui_select', TestFngUiSelectSchema);
}
module.exports = {
    model: E
};
//# sourceMappingURL=test-fng-ui-select.js.map