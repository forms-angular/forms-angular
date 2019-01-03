"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var shelfRef = { property: 'shelves', value: 'location' };
var ShelfSchemaDef = {
    location: { type: String, required: true }
};
var ShelfSchema = new mongoose_1.Schema(ShelfSchemaDef); // Note that this schema needs an _id as it is an internal lookup
var StockItemSchemaDef = {
    description: { type: String, required: true },
    shelf: { type: mongoose_1.Schema.Types.ObjectId, internalRef: shelfRef }
};
var StockItemSchema = new mongoose_1.Schema(StockItemSchemaDef, { _id: false }); // _id is suppressed on this schema as it is not needed for this example (but would be needed in a real world use case)
var KSchemaDef = {
    warehouse_name: { type: String, required: true, list: {}, index: true },
    postcode: { type: String, index: true },
    shelves: { type: [ShelfSchema] },
    items: { type: [StockItemSchema] },
    cleanedShelves: { type: [mongoose_1.Schema.Types.ObjectId], internalRef: shelfRef },
    favouriteShelf: { type: mongoose_1.Schema.Types.ObjectId, internalRef: shelfRef }
};
var KSchema = new mongoose_1.Schema(KSchemaDef);
var K;
var name = 'k_referencing_self_collection';
try {
    K = mongoose_1.model(name);
}
catch (e) {
    K = mongoose_1.model(name, KSchema);
}
module.exports = {
    model: K
};
//# sourceMappingURL=k_referencing_self.js.map