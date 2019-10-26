"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ZSchemaDef = {
    surname: String,
    forename: String,
    weight: Number,
    dateOfBirth: Date,
    termsAccepted: Boolean
};
const ZSchema = new mongoose_1.Schema(ZSchemaDef);
let Z;
try {
    Z = mongoose_1.model('z_custom_form');
}
catch (e) {
    Z = mongoose_1.model('z_custom_form', ZSchema);
}
module.exports = {
    model: Z
};
//# sourceMappingURL=z_custom_form.js.map