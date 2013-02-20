var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ASchema = new Schema({
    surname: String,
    forename: String,
    weight: Number,
    dateOfBirth: Date,
    accepted: Boolean
});

var A = mongoose.model('A', ASchema);

module.exports = A;
