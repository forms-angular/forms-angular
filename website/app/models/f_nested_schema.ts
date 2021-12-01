import {fngServer} from "../../../src/server";

const jqUploads = require('fng-jq-upload');
import { Schema, model } from "mongoose";
import { IFngSchemaDefinition } from "../../../src/fng-schema";
import ResourceExport = fngServer.ResourceExport;

const ExamsSchemaDef : IFngSchemaDefinition = {
  subject: {type: String, required: true, form:{popup:'Exam subject'}},
  examDate: {type: Date, required: true, default: new Date(), form: {popup: 'Exam date', add: " ng-model-options=\"{timezone:'UTC'}\""}},
  score: {type: Number, default: 60, form:{popup: 'Exam score'}},
  result: {type: String, enum: ['distinction', 'merit', 'pass', 'fail'], default: 'pass'},
  scan: {type: [new Schema(jqUploads.FileSchema)], form: {hidden: true, help:'Attach a scan of the paper - maximum size 0.5MB', directive: 'fng-jq-upload-form', fngJqUploadForm:{single:true, autoUpload: true, sizeLimit:524288}}},
  grader: { type: Schema.Types.ObjectId, ref:'b_enhanced_schema', form: {directive: 'fng-ui-select', fngUiSelect: {fngAjax: true}, label: 'Marked By'}},
  retakeDate: {type: Date, form: {popup: 'Retake date for this exam', showWhen: {lhs: '$exams.result', comp: 'eq', rhs: 'fail'}}}
};

const ExamsSchema = new Schema(ExamsSchemaDef, {id: false});

const fSchemaDef: IFngSchemaDefinition = {
  surname: {type: String, index: true, required: true, list: {}},
  forename: {type: String, index: true, list: true},
  exams: {type: [ExamsSchema], form: {sortable: true, noRemove: 'record.exams[$index].result' /*, formStyle: 'stacked' */ }}
};

const FSchema = new Schema(fSchemaDef);
let F;
try {
  F = model('f_nested_schema');
} catch (e) {
  F = model('f_nested_schema', FSchema);
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
  if (req.query && req.query.q && req.query.q.length > 0 && req.query.q.slice(0,6).toLowerCase() === "exams:") {
    retVal.resourceText = '';
  }
  return Promise.resolve(retVal);
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
    case 'link':
      formSchema = {
        surname: {},
        forename: {},
        exams: {
          schema: {
            subject: {}, examDate: {}, score: {}, result: {},
            grader: {link: {linkOnly: false, label: true}}
          }
        }
      };
      break;
  }
  return formSchema;
};

const resourceExport: ResourceExport = {
  model: F,
  options: {
    searchResultFormat: F.prototype.searchResultFormat,
    synonyms: ['exams'],
  }
};

module.exports = resourceExport;


