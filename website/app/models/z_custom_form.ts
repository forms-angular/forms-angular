import { Schema, model } from "mongoose";
import { IFngSchemaDefinition } from "../../../src/fng-schema";

const ZSchemaDef: IFngSchemaDefinition = {
  surname: String,
  forename: String,
  weight: Number,
  dateOfBirth: Date,
  termsAccepted: Boolean
};

const ZSchema = new Schema(ZSchemaDef);

let Z;
try {
  Z = model('z_custom_form');
} catch (e) {
  Z = model('z_custom_form', ZSchema);
}

module.exports = {
  model: Z
};
