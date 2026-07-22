import { Schema, model } from "mongoose";
import { IFngSchemaDefinition } from "../../../src/fng-schema";

const NestedSchemaDef : IFngSchemaDefinition = {
  someText: {type: String, required: true},
  anEnum: {type: String, enum: ['A Option', 'B Option', 'C Option'], form: {directive: 'fng-ui-select'}},
  singleCached:            { type: Schema.Types.ObjectId,  ref:'b_enhanced_schema', form: {directive: 'fng-ui-select'}},
  singleAjax:              { type: Schema.Types.ObjectId,  ref:'b_enhanced_schema', form: {directive: 'fng-ui-select', fngUiSelect: {fngAjax: true}}},
  filteredAjax:            { type: Schema.Types.ObjectId,  ref:'b_enhanced_schema', form: {directive: 'fng-ui-select', fngUiSelect: {fngAjax: escape(JSON.stringify({interviewScore:{$gt:90}})) }}}
};

const NestedSchema = new Schema(NestedSchemaDef, {_id: false});

// A second level of array nesting, carrying an ajax lookup.  Displaying one of these means
// converting the stored id into the {id, text} the control shows, and that conversion has to reach
// through both levels and land in the right row - see 031_nested_lookup_display.spec.ts.
const DeeplyNestedSchemaDef: IFngSchemaDefinition = {
  role: {type: String},
  deepAjax: { type: Schema.Types.ObjectId, ref:'b_enhanced_schema', form: {directive: 'fng-ui-select', fngUiSelect: {fngAjax: true}}}
};

const DeeplyNestedSchema = new Schema(DeeplyNestedSchemaDef, {_id: false});

const DoublyNestedSchemaDef: IFngSchemaDefinition = {
  team: {type: String},
  members: [DeeplyNestedSchema]
};

const DoublyNestedSchema = new Schema(DoublyNestedSchemaDef, {_id: false});

const TestNestedSelectSchemaDef: IFngSchemaDefinition = {
  surname: {type: String, index: true, required: true, list: {}},
  forename: {type: String, index: true, list: true},
  nested: [NestedSchema],    // defaults to horizontal compact form
  teams: [DoublyNestedSchema]
};

const TestNestedSelectSchema = new Schema(TestNestedSelectSchemaDef);

let N;
try {
  N = model('test_nested_select');
} catch (e) {
  N = model('test_nested_select', TestNestedSelectSchema);
}

module.exports = {
  model: N
};



