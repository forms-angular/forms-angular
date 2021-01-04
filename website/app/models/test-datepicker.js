"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var TestDatePickerSchemaDef = {
    surname: { type: String, required: true, list: {} },
    dateOfBirth: {
        type: Date,
        required: true,
        form: {
            directive: "fng-ui-bootstrap-date-picker",
            fngUiBootstrapDatePicker: {
                format: "dd/MM/yyyy",
                "ng-model-options": "{timezone:'UTC'}",
            },
        }
    },
    appointment: {
        type: Date,
        required: true,
        form: {
            directive: "fng-ui-bootstrap-datetime-picker",
            fngUiBootstrapDatetimePicker: {
                "date-format": "dd/MM/yyyy",
                "date-options": "{'show-weeks':false}",
            },
        }
    }
};
var TestDatePickerSchema = new mongoose_1.Schema(TestDatePickerSchemaDef);
var E;
try {
    E = mongoose_1.model('test_date_picker');
}
catch (e) {
    E = mongoose_1.model('test_date_picker', TestDatePickerSchema);
}
module.exports = {
    model: E
};
//# sourceMappingURL=test-datepicker.js.map