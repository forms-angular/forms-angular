'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ApplicantSchema = new Schema({
  surname: {type:String, required:true, index:true},
  forename: {type:String, index:true},
  /* On the next field we set an HTML5 input type
  This is the only addition to standard Mongoose schema format in this simple example */ 
  dateOfBirth: {type:Date, form:{type:"date"}},    
  status: {type: String, default:'Pending', enum:['Pending','Rejected','Shortlist']}
});

var Applicant;
var modelName = 'applicant';

try {
  Applicant = mongoose.model(modelName);
} catch(e) {
  Applicant = mongoose.model(modelName, ApplicantSchema);
}

module.exports = Applicant;
