'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var shelfRef = {type: 'internal', property: 'shelves', value:'location'};

var ShelfSchema = new Schema({
  location: {type: String, required: true}
});  // Note that this schema needs an _id as it is an internal lookup

var StockItemSchema = new Schema({
  description: {type: String, required: true},
  shelf: {type: Schema.Types.ObjectId, ref: shelfRef}
}, {_id: false});    // _id is suppressed on this schema as it is not needed for this example (but would be needed in a real world use case)

var ESchema = new Schema({
  warehouse_name: {type: String, list: {}},
  shelves: {type: [ShelfSchema]},
  items: {type: [StockItemSchema]},
  cleanedShelves: {type: [Schema.Types.ObjectId], ref: shelfRef},
  favouriteShelf: {type: Schema.Types.ObjectId, ref: shelfRef}
});

var K;
var name = 'k_referencing_self_collection';
try {
  K = mongoose.model(name);
} catch (e) {
  K = mongoose.model(name, ESchema);
}


module.exports = {
  model: K
};


