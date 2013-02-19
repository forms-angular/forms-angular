var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ExamsSchema = new Schema({
    subject: String,
    examDate: Date,
    score: Number
});

var FSchema = new Schema({
    surname: {type: String, list:{}},
    forename:  {type: String, list:true},
    exams: [ExamsSchema]
});

var F = mongoose.model('F', FSchema);

module.exports = F;


