import { Schema, model } from "mongoose";
import { IFngSchemaDefinition } from "../../../src/fng-schema";

const dSchemaDef: IFngSchemaDefinition = {  surname: {type: String, list: {}},
  forename: {type: String, list: true},
  weight: {type: Number, form: {label: 'Weight (lbs)'}},
  dateOfBirth: Date,
  accepted: Boolean,
  specialSubjects: [String],
  hobbies: [{type: String}],
  sports: {type: [String]},
  someOptions:  {type: [String], enum:['First','Second','Third']},
  someOptions2:[{type:  String , enum:['First','Second','Third']}],
  yetMoreOptions:   {type: [String], enum:['First','Second','Third'], form:{directive: 'fng-ui-select'}},
  evenMoreOptions:  {type: [String], enum:['First','Second','Third'], form:{directive: 'fng-ui-select', fngUiSelect: {forceMultiple: true}}},
  yetMoreOptions2: [{type:  String , enum:['First','Second','Third'], form:{directive: 'fng-ui-select'}}],
  evenMoreOptions2:[{type:  String , enum:['First','Second','Third'], form:{directive: 'fng-ui-select', fngUiSelect: {forceMultiple: true}}}]
};

const DSchema = new Schema(dSchemaDef);

let D;

try {
  D = model('d_array_example');
} catch (e) {
  D = model('d_array_example', DSchema);
}

module.exports = {
  model : D
};

