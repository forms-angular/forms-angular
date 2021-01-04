import { Schema, model } from "mongoose";
import { IFngSchemaDefinition } from "../../../src/fng-schema";

const TestDatePickerSchemaDef : IFngSchemaDefinition = {
    surname: {type: String, required: true, list: {}},
    dateOfBirth: {
        type: Date,
        required: true,
        form:{
            directive: "fng-ui-bootstrap-date-picker",
            fngUiBootstrapDatePicker: {
                format: "dd/MM/yyyy",
                "ng-model-options": "{timezone:'UTC'}",
            },
        }},
    appointment: {
        type : Date,
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

const TestDatePickerSchema = new Schema(TestDatePickerSchemaDef);

let E;
try {
    E = model('test_date_picker');
} catch (e) {
    E = model('test_date_picker', TestDatePickerSchema);
}

module.exports = {
    model: E
};



