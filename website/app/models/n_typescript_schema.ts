import { Document, Schema, Model, model} from "mongoose";
import { INType } from "../interfaces/n_type";
import { IFngSchemaDefinition } from "../../../src/fng-schema";
const fngAudit = require("fng-audit");

export interface INModel extends INType, Document {}

const NSchemaDef: IFngSchemaDefinition = {
  surname: {type: String, required: true, index: true},
  forename: {type: String, index: true},
  phone: {type: String, required: true, match:/^\d{10,12}$/},
  nationality: {type: String, default: 'European'},
  weight: Number,
  eyeColour: {type: String, required: true, enum: ['Blue', 'Brown', 'Green', 'Hazel']},
  dateOfBirth: Date,
  accepted: {type: Boolean, default: true}
};

const NSchema = new Schema(NSchemaDef);

let N: Model<INModel>;

try {
  N = model('n_typescript_schema');
} catch (e) {
  NSchema.plugin(fngAudit.plugin, {});
  N = model('n_typescript_schema', NSchema);
}

module.exports = {
  model: N
};
