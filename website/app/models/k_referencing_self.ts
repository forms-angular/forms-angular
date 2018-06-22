import { Schema, model } from "mongoose";
import { IFngSchemaDefinition } from "../../../src/fng-schema";

const shelfRef = {type: 'internal', property: 'shelves', value:'location'};

const ShelfSchemaDef: IFngSchemaDefinition = {
  location: {type: String, required: true}
};

const ShelfSchema = new Schema(ShelfSchemaDef); // Note that this schema needs an _id as it is an internal lookup

const StockItemSchemaDef: IFngSchemaDefinition = {
  description: {type: String, required: true},
  shelf: {type: Schema.Types.ObjectId, ref: shelfRef}
};

const StockItemSchema = new Schema(StockItemSchemaDef, {_id: false});    // _id is suppressed on this schema as it is not needed for this example (but would be needed in a real world use case)

const ESchemaDef : IFngSchemaDefinition = {
  warehouse_name: {type: String, list: {}},
  shelves: {type: [ShelfSchema]},
  items: {type: [StockItemSchema]},
  cleanedShelves: {type: [Schema.Types.ObjectId], ref: shelfRef},
  favouriteShelf: {type: Schema.Types.ObjectId, ref: shelfRef}
};

const ESchema = new Schema(ESchemaDef);

let K;
const name = 'k_referencing_self_collection';
try {
  K = model(name);
} catch (e) {
  K = model(name, ESchema);
}


module.exports = {
  model: K
};


