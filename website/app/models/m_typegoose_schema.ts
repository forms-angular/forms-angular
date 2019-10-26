/*
  This is the typegoose (https://github.com/typegoose/typegoose) equivalent of a_unadorned_schema
  Would require considerable extension of typegoose to do anything beyond this though
 */

import { prop, index, getModelForClass } from '@typegoose/typegoose';

enum EyeColour {
  BLUE = 'Blue',
  BROWN = 'Brown',
  GREEN = 'Green',
  HAZEL = 'Hazel'
}

@index({ surname: 1 })
@index({ forename: 1 })
export class MTypegooseSchema {
  @prop({required: true})
  public surname!: string;

  @prop()
  public forename: string;

  @prop({required: true, validate: /^\d{10,12}$/})
  public phone!: string;

  @prop({default: 'European'})
  public nationality: string;

  @prop()
  public weight: number;

  @prop({required: true, enum: EyeColour})
  public eyeColour!: string;

  @prop()
  public dateOfBirth: Date;

  @prop({default: true})
  public accepted: boolean;

}

const TypegooseModel = getModelForClass(MTypegooseSchema); // TypegooseModel is a regular Mongoose Model with correct types

// So now we can use type checking, but only on the server
let test = new MTypegooseSchema();
test.surname = 'Smith';

module.exports = {
  model: TypegooseModel
};
