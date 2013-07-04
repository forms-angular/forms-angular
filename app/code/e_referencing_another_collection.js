var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ESchema = new Schema({
    surname: {type: String, list:{}},
    forename:  {type: String, list:true},
    weight: {type : Number, form:{label:"Weight (lbs)"}},
    teacher: { type: Schema.Types.ObjectId, ref: 'b_using_options', form:{select2:true}},
    dateOfBirth: Date,
    accepted: Boolean,
    assistants: [{ type: Schema.Types.ObjectId, ref: 'a_unadorned_mongoose'}]
});

var E = mongoose.model('E', ESchema);

module.exports = E;


