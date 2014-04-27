'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ASchema = new Schema({
    surname: {type:String, required:true, index:true},
    forename: {type:String, index:true},
    phone: {type:String},
    weight: Number,
    eyeColour: {type: String, required:true, enum:['Blue','Brown','Green','Hazel']},
    dateOfBirth: Date,
    accepted: Boolean
});

var A;

try {A = mongoose.model('A');} catch(e) {A = mongoose.model('A', ASchema);}

module.exports = A;
