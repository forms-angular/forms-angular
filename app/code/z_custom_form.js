var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ASchema = new Schema({
    surname: String,
    forename: String,
    weight: Number,
    dateOfBirth: Date,
    termsAccepted: Boolean
});

var Z = mongoose.model('Z', ASchema);

module.exports = Z;
