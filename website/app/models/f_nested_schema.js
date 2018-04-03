'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var jqUploads = require('fng-jq-upload');

var ExamsSchema = new Schema({
  subject: {type: String, required: true},
  examDate: {type: Date, required: true},
  score: Number,
  result: {type: String, enum: ['distinction', 'merit', 'pass', 'fail']},
  scan: {type: [new Schema(jqUploads.FileSchema)], form: {hidden: true, help:'Attach a scan of the paper - maximumm size 0.5MB', directive: 'fng-jq-upload-form', fngJqUploadForm:{single:true, autoUpload: true, sizeLimit:524288}}},
  grader: { type: Schema.Types.ObjectId, ref: 'b_enhanced_schema', form: {directive: 'fng-ui-select', fngUiSelect: {fngAjax: true}, label: 'Marked By'}},
  retakeDate: {type: Date, form: {showWhen: {lhs: '$exams.result', comp: 'eq', rhs: 'fail'}}}
}, {_id: false});

var FSchema = new Schema({
  surname: {type: String, index: true, required: true, list: {}},
  forename: {type: String, index: true, list: true},
  exams: [ExamsSchema]    // defaults to horizontal compact form
  // or
  //exams: {type: [ExamsSchema], form: {formStyle: 'inline'}}
});

var F;
try {
  F = mongoose.model('f_nested_schema');
} catch (e) {
  F = mongoose.model('f_nested_schema', FSchema);
}

F.prototype.searchResultFormat = function () {

  // You can set up a function to modify search result display and the
  // ordering within a collection
  var weighting;

  weighting = this.forename === 'John' ? 2 : 3;

  return {
    resource: 'f_nested_schema',
    resourceText: 'Exams',
    id: this._id,
    weighting: weighting,
    text: this.surname + (this.forename ? ', ' + this.forename : '')
  };
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
      // English and Maths exams from the array
      formSchema = {
        surname: {},
        forename: {},
        exams: {schema: {
          subject: {},
          result: {label: 'Outcome'}
        }}
      };
      break;
    case 'EnglishPaper' :
      formSchema = {
        surname: {},
        forename: {},
        exams: {
          subkey: {
            keyList: {subject: 'English'},
            containerType: 'well',
            title: 'English Exam'
          },
          schema: {
            examDate: {}, score: {}, result: {},
            scan: {hidden: false}
          }
        }
      };
      break;
  }
  return formSchema;
};

module.exports = {
  model: F,
  options: {
    searchResultFormat: F.prototype.searchResultFormat
  }
};


