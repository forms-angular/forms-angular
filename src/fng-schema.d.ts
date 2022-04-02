// TODO: subkeys etc, return types of statics.form & statics.report

import { Schema, SchemaType, SchemaTypeOptions } from "mongoose";
// @ts-ignore
import IFngSchemaTypeFormOpts = fng.IFngSchemaTypeFormOpts;

  /*
  A 'list' attribute, or maybe a 'key' attribute, is one that can be generally used to identify a document.

  For example in a person collection, firstName and lastName would be (perhaps sufficient) list items.

  They are used when generating lists in the default forms, and generating options for selects when referencing another
  collection.
   */

  export interface IFngSchemaTypesOpts<T> extends SchemaTypeOptions<T> {
    secure?: boolean;     // // secure prevents the data from being sent by the API
    list?: {} | true;
    form?: IFngSchemaTypeFormOpts;
  }

  export interface IFngSchemaDefinition {
    [path: string]: IFngSchemaTypesOpts<any> | Schema | SchemaType;
  }
