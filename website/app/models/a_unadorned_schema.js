"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const fngAudit = require("fng-audit");
const aSchemaDef = {
    surname: { type: String, required: true, index: true },
    forename: { type: String, index: true },
    phone: { type: String, required: true, match: /^\d{10,12}$/ },
    nationality: { type: String, default: 'European' },
    weight: Number,
    eyeColour: { type: String, required: true, enum: ['Blue', 'Brown', 'Green', 'Hazel'] },
    dateOfBirth: Date,
    accepted: { type: Boolean, default: true }
};
const ASchema = new mongoose_1.Schema(aSchemaDef);
let A;
try {
    A = mongoose_1.model('a_unadorned_schema');
}
catch (e) {
    ASchema.plugin(fngAudit.plugin, {});
    A = mongoose_1.model('a_unadorned_schema', ASchema);
}
module.exports = {
    model: A
};
//# sourceMappingURL=a_unadorned_schema.js.map