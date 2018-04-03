'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var fngAudit = require("fng-audit");


var ASchema = new Schema({
  surname: {type: String, required: true, index: true},
  forename: {type: String, index: true},
  phone: {type: String},
  weight: Number,
  eyeColour: {type: String, required: true, enum: ['Blue', 'Brown', 'Green', 'Hazel']},
  dateOfBirth: Date,
  accepted: Boolean
});

var A;

try {
  A = mongoose.model('a_unadorned_schema');
} catch (e) {
  ASchema.plugin(fngAudit.plugin, {});
  A = mongoose.model('a_unadorned_schema', ASchema);
}

module.exports = {
  model: A
};
