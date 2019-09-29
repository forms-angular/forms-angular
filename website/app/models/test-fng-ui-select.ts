import { Schema, model } from "mongoose";
import { IFngSchemaDefinition } from "../../../src/fng-schema";

const TestFngUiSelectSchemaDef : IFngSchemaDefinition = {
  surname: {type: String, list: {}},
  forename: {type: String, list: true},
  derivedText: {type: String, form: {directive: "fng-ui-select", fngUiSelect: { deriveOptions: "getDerivedText" } } },
  derivedObj:  {type: String, form: {directive: "fng-ui-select", fngUiSelect: { deriveOptions: "getDerivedObj"  } } },
  singleCached:            { type: Schema.Types.ObjectId,  ref:'b_enhanced_schema', form: {directive: 'fng-ui-select'}},
  singleAjax:              { type: Schema.Types.ObjectId,  ref:'b_enhanced_schema', form: {directive: 'fng-ui-select', fngUiSelect: {fngAjax: true}}},
  multiOutsideCached:    [ { type: Schema.Types.ObjectId,  ref:'f_nested_schema',   form: {directive: 'fng-ui-select', size: 'xxlarge' }} ],
  multiInsideCached:       { type:[Schema.Types.ObjectId], ref:'f_nested_schema',   form: {directive: 'fng-ui-select', size: 'xxlarge' }},
  multiOutsideAjax:      [ { type: Schema.Types.ObjectId,  ref:'f_nested_schema',   form: {directive: 'fng-ui-select', size: 'xxlarge', fngUiSelect: {fngAjax: true}}} ],
  multiInsideAjax:         { type:[Schema.Types.ObjectId], ref:'f_nested_schema',   form: {directive: 'fng-ui-select', size: 'xxlarge', fngUiSelect: {fngAjax: true}}},
  multipleOutsideCached: [ { type: Schema.Types.ObjectId,  ref:'f_nested_schema',   form: {directive: 'fng-ui-select', size: 'xxlarge', fngUiSelect: {forceMultiple: true}, label: 'Multiple Out. Cached' }} ],
  multipleInsideCached:    { type:[Schema.Types.ObjectId], ref:'f_nested_schema',   form: {directive: 'fng-ui-select', size: 'xxlarge', fngUiSelect: {forceMultiple: true}, label: 'Multiple In. Cached'  }},
  multipleOutsideAjax  : [ { type: Schema.Types.ObjectId,  ref:'f_nested_schema',   form: {directive: 'fng-ui-select', size: 'xxlarge', fngUiSelect: {fngAjax: true}, label: 'Multiple Out. Ajax'   }} ],
  multipleInsideAjax:      { type:[Schema.Types.ObjectId], ref:'f_nested_schema',   form: {directive: 'fng-ui-select', size: 'xxlarge', fngUiSelect: {fngAjax: true}, label: 'Multiple In. Ajax'    }},
  filteredAjax:            { type: Schema.Types.ObjectId,  ref:'b_enhanced_schema', form: {directive: 'fng-ui-select', fngUiSelect: {fngAjax: escape(JSON.stringify({interviewScore:{$gt:90}})) }}}
};

const TestFngUiSelectSchema = new Schema(TestFngUiSelectSchemaDef);

let E;
try {
  E = model('test_fng_ui_select');
} catch (e) {
  E = model('test_fng_ui_select', TestFngUiSelectSchema);
}

module.exports = {
  model: E
};



