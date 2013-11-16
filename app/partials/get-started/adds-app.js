var mongoose = require('mongoose');
var formsAngular = require('forms-angular');

mongoose.connect('mongodb://localhost/mydb');

var Schema = mongoose.Schema;

var ApplicantSchema = new Schema({
    surname: {type:String, required:true, index:true},
    forename: {type:String, index:true}
});

var Applicant = mongoose.model('Applicant', ApplicantSchema);

var DataFormHandler = new (formsAngular)(app);
DataFormHandler.addResource('applicant', Applicant);   // Create and add more schemas to taste