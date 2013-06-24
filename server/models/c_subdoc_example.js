var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CSchema = new Schema({
    surname: {type: String, list:{}},
    forename:  {type: String, list:true},
    weight: {type : Number, form:{label:"Weight (lbs)"}},
    hairColour: {type: String, enum:['Black','Brown','Blonde','Bald'], required: true, form:{placeHolder:"Select hair colour (required)", select2: {}}},  // Required combo has appropriate styling
    dateOfBirth: Date,
    accepted: Boolean,
    interview: {
        score:{type:Number},
        date:{type:Date}
    }
});

var C = mongoose.model('C', CSchema);

module.exports = C;
