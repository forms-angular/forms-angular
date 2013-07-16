var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GSchema = new Schema({
    surname: {type: String, list:{}, index:true},
    forename:  {type: String, list:true, index:true},
    accepted: {type:Boolean, form:{help:'When someone is accepted additional fields appear'}},
    startDate:{type:Date, form:{showIf: {lhs: '$accepted', comp: 'eq', rhs: true}}},
    startingPosition:{type:String, form:{showIf: {lhs: '$accepted', comp: 'eq', rhs: true}}}
});

var G;
try {G = mongoose.model('G') } catch(e) {G = mongoose.model('G', GSchema)}

module.exports = {
    model : G,
    searchImportance: 1,
    searchOrder: {surname:1},
    listOrder: {surname:1}
};
