'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ZSchema = new Schema({
  surname: String,
  forename: String,
  weight: Number,
  dateOfBirth: Date,
  termsAccepted: Boolean
});

var Z;
try {
  Z = mongoose.model('z_custom_form');
} catch (e) {
  Z = mongoose.model('z_custom_form', ZSchema);
}

module.exports = {
  model: Z
};
