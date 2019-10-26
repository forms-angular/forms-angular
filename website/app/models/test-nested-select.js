"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NestedSchemaDef = {
    someText: { type: String, required: true },
    anEnum: { type: String, enum: ['A Option', 'B Option', 'C Option'], form: { directive: 'fng-ui-select' } },
    singleCached: { type: mongoose_1.Schema.Types.ObjectId, ref: 'b_enhanced_schema', form: { directive: 'fng-ui-select' } },
    singleAjax: { type: mongoose_1.Schema.Types.ObjectId, ref: 'b_enhanced_schema', form: { directive: 'fng-ui-select', fngUiSelect: { fngAjax: true } } },
    filteredAjax: { type: mongoose_1.Schema.Types.ObjectId, ref: 'b_enhanced_schema', form: { directive: 'fng-ui-select', fngUiSelect: { fngAjax: escape(JSON.stringify({ interviewScore: { $gt: 90 } })) } } }
};
const NestedSchema = new mongoose_1.Schema(NestedSchemaDef, { _id: false });
const TestNestedSelectSchemaDef = {
    surname: { type: String, index: true, required: true, list: {} },
    forename: { type: String, index: true, list: true },
    nested: [NestedSchema] // defaults to horizontal compact form
};
const TestNestedSelectSchema = new mongoose_1.Schema(TestNestedSelectSchemaDef);
let N;
try {
    N = mongoose_1.model('test_nested_select');
}
catch (e) {
    N = mongoose_1.model('test_nested_select', TestNestedSelectSchema);
}
module.exports = {
    model: N
};
//# sourceMappingURL=test-nested-select.js.map