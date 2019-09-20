import { Schema, model } from "mongoose";
import { IFngSchemaDefinition } from "../../../src/fng-schema";
const fngAudit = require("fng-audit");

const aSchemaDef: IFngSchemaDefinition = {
  surname: {type: String, required: true, index: true},
  forename: {type: String, index: true},
  phone: {type: String, required: true, match:/^\d{10,12}$/},
  nationality: {type: String, default: 'European'},
  weight: Number,
  eyeColour: {type: String, required: true, enum: ['Blue', 'Brown', 'Green', 'Hazel']},
  dateOfBirth: Date,
  accepted: {type: Boolean, default: true}
};

const ASchema = new Schema(aSchemaDef);

let A;

try {
  A = model('a_unadorned_schema');
} catch (e) {
  ASchema.plugin(fngAudit.plugin, {});
  A = model('a_unadorned_schema', ASchema);
}

module.exports = {
  model: A
};
