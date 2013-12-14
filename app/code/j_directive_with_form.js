var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContactSchema = new Schema({
    contact: { type: Schema.Types.ObjectId, ref: 'a_unadorned_mongoose', form: {select2: {fngAjax: true}} },
    type: { type: String, enum: ['teacher', 'friend', 'other']}
}, {_id: false});

var JSchema = new Schema({
    surname: {type: String, required: true, list:{}},
    forename:  {type: String, list:true},
    contactList: {type: [ContactSchema], form: {directive: 'contacts'}}
});

var J;
try {J = mongoose.model('J') } catch(e) {J = mongoose.model('J', JSchema)}

module.exports = J;

