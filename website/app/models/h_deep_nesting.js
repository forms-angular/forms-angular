'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CourseTeachersSchema = new Schema({
  teacher: { type: Schema.Types.ObjectId, ref: 'b_enhanced_schema'},
  room: Number
});

var ExamsSchema = new Schema({
  subject: { type: String},
  examDate: Date,
  score: Number,
  result: {type: String, enum: ['distinction', 'merit', 'pass', 'fail']},
  grader: { type: Schema.Types.ObjectId, ref: 'b_enhanced_schema'}
});

var CourseSchema = new Schema({
  subject: String,
  grade: {type: String},
  teachers: [CourseTeachersSchema]
});

var HSchema = new Schema({
  surname: {type: String, list: {}},
  forename: {type: String, list: true},
  address: {
    street: String,
    town: String
  },
  studies: {
    courses: {type: [CourseSchema], form: {noRemove: true}},
    exams: [ExamsSchema]
  },
  assistants: [
    { type: Schema.Types.ObjectId, ref: 'b_enhanced_schema'}
  ]
});

var H;
try {
  H = mongoose.model('h_deep_nesting');
} catch (e) {
  H = mongoose.model('h_deep_nesting', HSchema);
}

module.exports = {
  model: H
};

