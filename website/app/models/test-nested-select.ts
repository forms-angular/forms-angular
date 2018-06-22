import { Schema, model } from "mongoose";
import { IFngSchemaDefinition } from "../../../src/fng-schema";

const NestedSchemaDef : IFngSchemaDefinition = {
  someText: {type: String, required: true},
  anEnum: {type: String, enum: ['A Option', 'B Option', 'C Option'], form: {directive: 'fng-ui-select'}},
  singleCached:            { type: Schema.Types.ObjectId,  ref:{type:'lookup', collection:'b_enhanced_schema'}, form: {directive: 'fng-ui-select'}},
  singleAjax:              { type: Schema.Types.ObjectId,  ref:{type:'lookup', collection:'b_enhanced_schema'}, form: {directive: 'fng-ui-select', fngUiSelect: {fngAjax: true}}},
  filteredAjax:            { type: Schema.Types.ObjectId,  ref:{type:'lookup', collection:'b_enhanced_schema'}, form: {directive: 'fng-ui-select', fngUiSelect: {fngAjax: escape(JSON.stringify({interviewScore:{$gt:90}})) }}}
};

const NestedSchema = new Schema(NestedSchemaDef, {_id: false});

const TestNestedSelectSchemaDef: IFngSchemaDefinition = {
  surname: {type: String, index: true, required: true, list: {}},
  forename: {type: String, index: true, list: true},
  nested: [NestedSchema]    // defaults to horizontal compact form
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



