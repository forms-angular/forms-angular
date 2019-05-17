import { Schema, model } from "mongoose";
import { IFngSchemaDefinition} from "../../../src/fng-schema";

const shelfRef = {property: 'shelves', value:'location'};

const ShelfSchemaDef: IFngSchemaDefinition = {
  location: {type: String, required: true}
};

const ShelfSchema = new Schema(ShelfSchemaDef); // Note that this schema needs an _id as it is an internal lookup

const StockItemSchemaDef: IFngSchemaDefinition = {
  description: {type: String, required: true},
  shelf: {type: Schema.Types.ObjectId, internalRef: shelfRef }
};

const StockItemSchema = new Schema(StockItemSchemaDef, {_id: false});    // _id is suppressed on this schema as it is not needed for this example (but would be needed in a real world use case)

const KSchemaDef : IFngSchemaDefinition = {
  warehouse_name: {type: String, required: true, list: {}, index: true},
  postcode: {type: String, index: true},
  shelves: {type: [ShelfSchema]},
  items: {type: [StockItemSchema]},
  cleanedShelves: {type: [Schema.Types.ObjectId], internalRef: shelfRef},
  favouriteShelf: {type: Schema.Types.ObjectId, internalRef: shelfRef}
};

const KSchema = new Schema(KSchemaDef);

let K;
const name = 'k_referencing_self_collection';
try {
  K = model(name);
} catch (e) {
  K = model(name, KSchema);
}

module.exports = {
  model: K
};
