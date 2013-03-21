var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ESchema = new Schema({
    surname: {type: String, list:{}},
    forename:  {type: String, list:true},
    weight: {type : Number, form:{label:"Weight (lbs)"}},
    dateOfBirth: Date,
    accepted: Boolean,
    teacher: { type: Schema.Types.ObjectId, ref: 'b_using_options'},
    assistants: [{ type: Schema.Types.ObjectId, ref: 'a_unadorned_mongoose'}]
});

var E = mongoose.model('E', ESchema);

module.exports = E;


