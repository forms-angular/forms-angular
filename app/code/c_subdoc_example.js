var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CSchema = new Schema({
    surname: {type: String, list:{}},
    forename:  {type: String, list:true},
    weight: {type : Number, form:{label:"Weight (lbs)"}},
    dateOfBirth: Date,
    accepted: Boolean,
    interview: {
        score:{type:Number},
        date:{type:Date}
    }
});

var C = mongoose.model('C', CSchema);

module.exports = C;
