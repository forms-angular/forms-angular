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
try {Z = mongoose.model('Z');} catch(e) {Z = mongoose.model('Z', ZSchema);}

module.exports = Z;
