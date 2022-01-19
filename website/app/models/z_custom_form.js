"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var ZSchemaDef = {
    surname: String,
    forename: String,
    weight: Number,
    dateOfBirth: Date,
    termsAccepted: Boolean
};
var ZSchema = new mongoose_1.Schema(ZSchemaDef);
var Z;
try {
    Z = (0, mongoose_1.model)('z_custom_form');
}
catch (e) {
    Z = (0, mongoose_1.model)('z_custom_form', ZSchema);
}
module.exports = {
    model: Z
};
//# sourceMappingURL=z_custom_form.js.map