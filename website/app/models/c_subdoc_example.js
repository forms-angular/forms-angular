"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const cSchemaDef = {
    surname: { type: String, list: {} },
    forename: { type: String, list: true },
    weight: { type: Number, form: { label: 'Weight (lbs)' } },
    hairColour: { type: String, enum: ['Black', 'Brown', 'Blonde', 'Bald'], required: true, form: { placeHolder: 'Select hair colour (required)', directive: 'fng-ui-select' } },
    dateOfBirth: Date,
    accepted: Boolean,
    passwordHash: { type: String, secure: true, forms: { hidden: true } },
    interview: {
        score: { type: Number },
        date: { type: Date },
        interviewHash: { type: String, secure: true, forms: { hidden: true } }
    }
};
const CSchema = new mongoose_1.Schema(cSchemaDef);
let C;
try {
    C = mongoose_1.model('c_subdoc_example');
}
catch (e) {
    C = mongoose_1.model('c_subdoc_example', CSchema);
}
module.exports = {
    model: C
};
//# sourceMappingURL=c_subdoc_example.js.map