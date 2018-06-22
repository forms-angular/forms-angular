"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var dSchemaDef = { surname: { type: String, list: {} },
    forename: { type: String, list: true },
    weight: { type: Number, form: { label: 'Weight (lbs)' } },
    dateOfBirth: Date,
    accepted: Boolean,
    specialSubjects: [String],
    hobbies: [{ type: String }],
    sports: { type: [String] },
    someOptions: { type: [String], enum: ['First', 'Second', 'Third'] },
    someOptions2: [{ type: String, enum: ['First', 'Second', 'Third'] }],
    yetMoreOptions: { type: [String], enum: ['First', 'Second', 'Third'], form: { directive: 'fng-ui-select' } },
    evenMoreOptions: { type: [String], enum: ['First', 'Second', 'Third'], form: { directive: 'fng-ui-select', fngUiSelect: { forceMultiple: true } } },
    yetMoreOptions2: [{ type: String, enum: ['First', 'Second', 'Third'], form: { directive: 'fng-ui-select' } }],
    evenMoreOptions2: [{ type: String, enum: ['First', 'Second', 'Third'], form: { directive: 'fng-ui-select', fngUiSelect: { forceMultiple: true } } }]
};
var DSchema = new mongoose_1.Schema(dSchemaDef);
var D;
try {
    D = mongoose_1.model('d_array_example');
}
catch (e) {
    D = mongoose_1.model('d_array_example', DSchema);
}
module.exports = {
    model: D
};
//# sourceMappingURL=d_array_example.js.map