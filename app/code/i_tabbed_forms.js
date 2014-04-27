var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ISchema = new Schema({
    surname: {type: String, required: true, list:{}, form:{tab:'first'}},
    forename:  {type: String, list:true, form:{tab:'first'}},
    address: {
        line1: {type: String, form:{label: 'Address',tab:'first'}},
        line2: {type: String, form:{label: null,tab:'first'}},
        line3: {type: String, form:{label: null,tab:'first'}},
        town: {type: String, form:{label: 'Town', tab:'first'}},
        postcode: {type: String, form:{label: 'Postcode',tab:'first'}}
    },
    weight: {type : Number, form:{label:'Weight (lbs)',tab:'second'}},
    dateOfBirth: {type:Date, form:{tab:'second'}},
    accepted: {type: Boolean, form:{tab:'second'}},
    interviewScore:{type:Number,form:{tab:'second'},list:{}},
    freeText: {type: String, form:{type: 'textarea', rows:5, tab:'second'}}
});

var I;
try {I = mongoose.model('I');} catch(e) {I = mongoose.model('I', ISchema);}

module.exports = I;
