"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const shelfRef = { property: 'shelves', value: 'location' };
const ShelfSchemaDef = {
    location: { type: String, required: true }
};
const ShelfSchema = new mongoose_1.Schema(ShelfSchemaDef); // Note that this schema needs an _id as it is an internal lookup
const StockItemSchemaDef = {
    description: { type: String, required: true },
    shelf: { type: mongoose_1.Schema.Types.ObjectId, internalRef: shelfRef }
};
const StockItemSchema = new mongoose_1.Schema(StockItemSchemaDef, { _id: false }); // _id is suppressed on this schema as it is not needed for this example (but would be needed in a real world use case)
const KSchemaDef = {
    warehouse_name: { type: String, required: true, list: {}, index: true },
    postcode: { type: String, index: true },
    shelves: { type: [ShelfSchema] },
    items: { type: [StockItemSchema] },
    cleanedShelves: { type: [mongoose_1.Schema.Types.ObjectId], internalRef: shelfRef },
    favouriteShelf: { type: mongoose_1.Schema.Types.ObjectId, internalRef: shelfRef }
};
const KSchema = new mongoose_1.Schema(KSchemaDef);
let K;
const name = 'k_referencing_self_collection';
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