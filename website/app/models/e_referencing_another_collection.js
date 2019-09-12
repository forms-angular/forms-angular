"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var eSchemaDef = {
    surname: { type: String, list: {} },
    forename: { type: String, list: true },
    weight: { type: Number, form: { label: 'Weight (lbs)' } },
    leadMentor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'c_subdoc_example', required: true },
    mentor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'c_subdoc_example' },
    guide: { type: mongoose_1.Schema.Types.ObjectId, ref: 'b_enhanced_schema', form: { directive: 'fng-ui-select' } },
    teacher: { type: mongoose_1.Schema.Types.ObjectId, ref: 'b_enhanced_schema', form: { directive: 'fng-ui-select', fngUiSelect: { fngAjax: true } } },
    dateOfBirth: Date,
    assistants: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'a_unadorned_schema' }],
    assistants2: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'a_unadorned_schema' },
    team: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'f_nested_schema', form: { directive: 'fng-ui-select', fngUiSelect: { fngAjax: true } } }],
    team2: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'f_nested_schema', form: { directive: 'fng-ui-select', fngUiSelect: { fngAjax: true } } },
    accepted: Boolean
};
var ESchema = new mongoose_1.Schema(eSchemaDef);
var E;
try {
    E = mongoose_1.model('e_referencing_another_collection');
}
catch (e) {
    E = mongoose_1.model('e_referencing_another_collection', ESchema);
}
ESchema.statics.report = function (report) {
    var reportSchema = '';
    switch (report) {
        case 'class-sizes':
            reportSchema = {
                pipeline: [
                    { $group: { _id: '$teacher', count: { '$sum': 1 } } }
                ],
                title: 'Class Sizes',
                columnDefs: [
                    { field: '_id', displayName: 'Teacher' },
                    { field: 'count', displayName: 'Number in Class' }
                ],
                columnTranslations: [
                    { field: '_id', ref: 'b_enhanced_schema' }
                ]
            };
            break;
    }
    return reportSchema;
};
ESchema.statics.form = function (layout) {
    var formSchema = '';
    switch (layout) {
        case 'links':
            formSchema = {
                surname: {},
                forename: {},
                weight: {},
                leadMentor: { link: { linkOnly: true } },
                mentor: { link: { linkOnly: false, label: true } }
            };
            break;
    }
    return formSchema;
};
module.exports = {
    model: E
};
//# sourceMappingURL=e_referencing_another_collection.js.map