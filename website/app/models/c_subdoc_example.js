'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CSchema = new Schema({
  surname: {type: String, list: {}},
  forename: {type: String, list: true},
  weight: {type: Number, form: {label: 'Weight (lbs)'}},
  hairColour: {type: String, enum: ['Black', 'Brown', 'Blonde', 'Bald'], required: true, form: {placeHolder: 'Select hair colour (required)', directive: 'fng-ui-select'}},  // Required combo has appropriate styling
  dateOfBirth: Date,
  accepted: Boolean,
  passwordHash: {type: String, secure: true, forms: {hidden: true}},
  interview: {
    score: {type: Number},
    date: {type: Date},
    interviewHash: {type: String, secure: true, forms: {hidden: true}}
  }
});

var C;
try {
  C = mongoose.model('c_subdoc_example');
} catch (e) {
  C = mongoose.model('c_subdoc_example', CSchema);
}

module.exports = {
  model: C
};
