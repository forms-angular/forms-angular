'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NestedSchema = new Schema({
  someText: {type: String, required: true},
  anEnum: {type: String, enum: ['A Option', 'B Option', 'C Option'], form: {directive: 'fng-ui-select'}},
  singleCached:            { type: Schema.Types.ObjectId,  ref: 'b_enhanced_schema', form: {directive: 'fng-ui-select'}},
  singleAjax:              { type: Schema.Types.ObjectId,  ref: 'b_enhanced_schema', form: {directive: 'fng-ui-select', fngUiSelect: {fngAjax: true}}},
  filteredAjax:            { type: Schema.Types.ObjectId,  ref: 'b_enhanced_schema', form: {directive: 'fng-ui-select', fngUiSelect: {fngAjax: escape(JSON.stringify({interviewScore:{$gt:90}})) }}}
}, {_id: false});

var TestNestedSelectSchema = new Schema({
  surname: {type: String, index: true, required: true, list: {}},
  forename: {type: String, index: true, list: true},
  nested: [NestedSchema]    // defaults to horizontal compact form
});

var N;
try {
  N = mongoose.model('test_nested_select');
} catch (e) {
  N = mongoose.model('test_nested_select', TestNestedSelectSchema);
}

module.exports = {
  model: N
};



