"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const fngAudit = require("fng-audit");
const NSchemaDef = {
    surname: { type: String, required: true, index: true },
    forename: { type: String, index: true },
    phone: { type: String, required: true, match: /^\d{10,12}$/ },
    nationality: { type: String, default: 'European' },
    weight: Number,
    eyeColour: { type: String, required: true, enum: ['Blue', 'Brown', 'Green', 'Hazel'] },
    dateOfBirth: Date,
    accepted: { type: Boolean, default: true }
};
const NSchema = new mongoose_1.Schema(NSchemaDef);
let N;
try {
    N = mongoose_1.model('n_typescript_schema');
}
catch (e) {
    NSchema.plugin(fngAudit.plugin, {});
    N = mongoose_1.model('n_typescript_schema', NSchema);
}
module.exports = {
    model: N
};
//# sourceMappingURL=n_typescript_schema.js.map