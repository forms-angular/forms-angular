'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ExamsSchema = new Schema({
  subject: String,
  examDate: Date,
  score: Number,
  result: {type: String, enum: ['distinction', 'merit', 'pass', 'fail']},
  grader: { type: Schema.Types.ObjectId, ref: 'b_using_options', form: {select2: {fngAjax: true}, label:'Marked by'}},
  retakeDate: {type: Date, form: {showWhen: {lhs: '$exams.result', comp: 'eq', rhs: 'fail'}}}
}, {_id: false});

var FSchema = new Schema({
  surname: {type: String, index: true, list: {}},
  forename: {type: String, index: true, list: true},
  aTest: { type: Schema.Types.ObjectId, ref: 'b_using_options'},

//  exams: [ExamsSchema]    // defaults to horizontal compact form
  // or
  exams: {type: [ExamsSchema], form: {formStyle: 'inline'}}
});

var F;
try {
  F = mongoose.model('F');
} catch (e) {
  F = mongoose.model('F', FSchema);
}

F.prototype.searchResultFormat = function (req) {

  // You can set up a function to modify search result display and the
  // ordering within a collection
  let weighting;

  weighting = this.forename === 'John' ? 2 : 3;

  const retVal = {
    resource: 'f_nested_schema',
    resourceText: 'Exams',
    id: this._id,
    weighting: weighting,
    text: this.surname + (this.forename ? ', ' + this.forename : '')
  };
  if (req.query && req.query.q && req.query.q.length > 0) {
    if (req.query.q.slice(0, 6).toLowerCase() === 'exams:') {
      retVal.resourceText = ' ';
    } else if (req.query.q.slice(0, 8).toLowerCase() === 'retakes:') {
      retVal.resourceText = 'Retakes';
    }
  }
  return Promise.resolve(retVal);
};

FSchema.statics.form = function (layout) {
  var formSchema = '';
  switch (layout) {
    case 'English' :
      // Just the English exam from the array
      formSchema = {
        surname: {},
        forename: {},
        exams: {subkey: {keyList: {subject: 'English'}, containerType: 'well', title: 'English Exam'}}
      };
      break;
    case 'EnglishAndMaths' :
      // English and Maths exams from the array
      formSchema = {
        surname: {},
        forename: {},
        exams: {subkey: [
          {keyList: {subject: 'English'}, containerType: 'well', title: 'English Exam'},
          {keyList: {subject: 'Maths'}, containerType: 'well', title: 'Maths Exam'}
        ]}
      };
      break;
    case 'ResultsOnly' :
      // Demonstration of specifying fields within sub schemas in a form schema
      formSchema = {
        surname: {},
        forename: {},
        exams: {schema: {
          subject: {},
          result: {label: 'Outcome'}
        }}
      };
      break;
  }
  return formSchema;
};

module.exports = {
  model: F,
  synonyms: [{name:'exams'}, {name: 'retakes', filter:{'exams.result':'fail'}}],
  searchResultFormat: F.prototype.searchResultFormat
};


