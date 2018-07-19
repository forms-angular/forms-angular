"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var shelfRef = { type: 'lookupList', collection: '', id: '', property: 'shelves', value: 'location' };
var LSchemaDef = {
    description: { type: String, required: true, list: {} },
    warehouse: { type: mongoose_1.Schema.Types.ObjectId, ref: 'k_referencing_self_collection', form: { directive: 'fng-ui-select', fngUiSelect: { fngAjax: true } } },
    shelf: { type: mongoose_1.Schema.Types.ObjectId, ref: { type: 'lookupList', collection: 'k_referencing_self_collection', id: '$warehouse', property: 'shelves', value: 'location' } },
};
var LSchema = new mongoose_1.Schema(LSchemaDef);
var L;
var name = 'l_referencing_list_in_other_document';
try {
    L = mongoose_1.model(name);
}
catch (e) {
    L = mongoose_1.model(name, LSchema);
}
module.exports = {
    model: L
};
//# sourceMappingURL=l_referencing_list_on_other_document.js.map