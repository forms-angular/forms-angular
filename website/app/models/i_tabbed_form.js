"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var ISchemaDef = {
    surname: { type: String, required: true, list: {}, form: { tab: 'first' } },
    forename: { type: String, list: true, form: { tab: 'first' } },
    address: {
        line1: { type: String, form: { label: 'Address', tab: 'first' } },
        line2: { type: String, form: { label: null, tab: 'first' } },
        line3: { type: String, form: { label: null, tab: 'first' } },
        town: { type: String, form: { label: 'Town', tab: 'first' } },
        postcode: { type: String, form: { label: 'Postcode', tab: 'first' } }
    },
    weight: { type: Number, form: { label: 'Weight (lbs)', tab: 'second' } },
    dateOfBirth: { type: Date, form: { tab: 'second' } },
    accepted: { type: Boolean, form: { tab: 'second' } },
    interviewScore: { type: Number, form: { tab: 'second' }, list: {} },
    freeText: { type: String, form: { type: 'textarea', rows: 5, tab: 'second' } }
};
var ISchema = new mongoose_1.Schema(ISchemaDef);
var I;
try {
    I = (0, mongoose_1.model)('i_tabbed_form');
}
catch (e) {
    I = (0, mongoose_1.model)('i_tabbed_form', ISchema);
}
module.exports = {
    model: I
};
//# sourceMappingURL=i_tabbed_form.js.map