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
// A second level of array nesting, carrying an ajax lookup.  Displaying one of these means
// converting the stored id into the {id, text} the control shows, and that conversion has to reach
// through both levels and land in the right row - see 031_nested_lookup_display.spec.ts.
const DeeplyNestedSchemaDef = {
    role: { type: String },
    deepAjax: { type: mongoose_1.Schema.Types.ObjectId, ref: 'b_enhanced_schema', form: { directive: 'fng-ui-select', fngUiSelect: { fngAjax: true } } }
};
const DeeplyNestedSchema = new mongoose_1.Schema(DeeplyNestedSchemaDef, { _id: false });
const DoublyNestedSchemaDef = {
    team: { type: String },
    members: [DeeplyNestedSchema]
};
const DoublyNestedSchema = new mongoose_1.Schema(DoublyNestedSchemaDef, { _id: false });
const TestNestedSelectSchemaDef = {
    surname: { type: String, index: true, required: true, list: {} },
    forename: { type: String, index: true, list: true },
    nested: [NestedSchema],
    teams: [DoublyNestedSchema]
};
const TestNestedSelectSchema = new mongoose_1.Schema(TestNestedSelectSchemaDef);
let N;
try {
    N = (0, mongoose_1.model)('test_nested_select');
}
catch (e) {
    N = (0, mongoose_1.model)('test_nested_select', TestNestedSelectSchema);
}
module.exports = {
    model: N
};
