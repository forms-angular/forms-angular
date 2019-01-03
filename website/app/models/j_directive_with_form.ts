import { Schema, model } from "mongoose";
import { IFngSchemaDefinition } from "../../../src/fng-schema";

const FriendSchemaDef : IFngSchemaDefinition = {
  friend: { type: Schema.Types.ObjectId, ref:'a_unadorned_schema'},
  type: { type: String, enum: ['best friend', 'partner', 'colleague', 'acquaintance', 'other']},
  comment: { type: String}
};

const FriendSchema = new Schema(FriendSchemaDef, {_id: false});

const JSchemaDef: IFngSchemaDefinition = {
  surname: {type: String, required: true, list: {}},
  forename: {type: String, list: true},
  friendList: {type: [FriendSchema], form: {directive: 'friends'}}
};

const JSchema = new Schema(JSchemaDef);

let J;
try {
  J = model('j_directive_with_form');
} catch (e) {
  J = model('j_directive_with_form', JSchema);
}

module.exports = {
  model: J
};

