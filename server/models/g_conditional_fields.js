var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GSchema = new Schema({
    surname: {type: String, list:{}},
    forename:  {type: String, list:true},
    accepted: Boolean,
    startDate:{type:Date, form:{showIf: {lhs: '$accepted', comp: 'eq', rhs: true}}},
    startingPosition:{type:String, form:{showIf: {lhs: '$accepted', comp: 'eq', rhs: true}}}
});

var G = mongoose.model('G', GSchema);

module.exports = G;
