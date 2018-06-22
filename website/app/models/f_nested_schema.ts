const jqUploads = require('fng-jq-upload');
import { Schema, model } from "mongoose";
import { IFngSchemaDefinition } from "../../../src/fng-schema";

const ExamsSchemaDef : IFngSchemaDefinition = {
  subject: {type: String, required: true},
  examDate: {type: Date, required: true},
  score: Number,
  result: {type: String, enum: ['distinction', 'merit', 'pass', 'fail']},
  scan: {type: [new Schema(jqUploads.FileSchema)], form: {hidden: true, help:'Attach a scan of the paper - maximum size 0.5MB', directive: 'fng-jq-upload-form', fngJqUploadForm:{single:true, autoUpload: true, sizeLimit:524288}}},
  grader: { type: Schema.Types.ObjectId, ref:{type:'lookup', collection:'b_enhanced_schema'}, form: {directive: 'fng-ui-select', fngUiSelect: {fngAjax: true}, label: 'Marked By'}},
  retakeDate: {type: Date, form: {showWhen: {lhs: '$exams.result', comp: 'eq', rhs: 'fail'}}}
};

const ExamsSchema = new Schema(ExamsSchemaDef, {id: false});

const fSchemaDef: IFngSchemaDefinition = {
  surname: {type: String, index: true, required: true, list: {}},
  forename: {type: String, index: true, list: true},
  exams: {type: [ExamsSchema], form: {sortable: true}}
};

const FSchema = new Schema(fSchemaDef);
let F;
try {
  F = model('f_nested_schema');
} catch (e) {
  F = model('f_nested_schema', FSchema);
}

F.prototype.searchResultFormat = function () {

  // You can set up a function to modify search result display and the
  // ordering within a collection
  let weighting;

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
  let formSchema: any = '';
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


