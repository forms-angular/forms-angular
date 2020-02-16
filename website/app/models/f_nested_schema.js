"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jqUploads = require('fng-jq-upload');
var mongoose_1 = require("mongoose");
var ExamsSchemaDef = {
    subject: { type: String, required: true, form: { popup: 'Exam subject' } },
    examDate: { type: Date, required: true, default: new Date(), form: { popup: 'Exam date', add: " ng-model-options=\"{timezone:'UTC'}\"" } },
    score: { type: Number, default: 60, form: { popup: 'Exam score' } },
    result: { type: String, enum: ['distinction', 'merit', 'pass', 'fail'], default: 'pass' },
    scan: { type: [new mongoose_1.Schema(jqUploads.FileSchema)], form: { hidden: true, help: 'Attach a scan of the paper - maximum size 0.5MB', directive: 'fng-jq-upload-form', fngJqUploadForm: { single: true, autoUpload: true, sizeLimit: 524288 } } },
    grader: { type: mongoose_1.Schema.Types.ObjectId, ref: 'b_enhanced_schema', form: { directive: 'fng-ui-select', fngUiSelect: { fngAjax: true }, label: 'Marked By' } },
    retakeDate: { type: Date, form: { popup: 'Retake date for this exam', showWhen: { lhs: '$exams.result', comp: 'eq', rhs: 'fail' } } }
};
var ExamsSchema = new mongoose_1.Schema(ExamsSchemaDef, { id: false });
var fSchemaDef = {
    surname: { type: String, index: true, required: true, list: {} },
    forename: { type: String, index: true, list: true },
    exams: { type: [ExamsSchema], form: { sortable: true, noRemove: 'record.exams[$index].result' /*, formStyle: 'stacked' */ } }
};
var FSchema = new mongoose_1.Schema(fSchemaDef);
var F;
try {
    F = mongoose_1.model('f_nested_schema');
}
catch (e) {
    F = mongoose_1.model('f_nested_schema', FSchema);
}
F.prototype.searchResultFormat = function () {
    // You can set up a function to modify search result display and the
    // ordering within a collection
    var weighting;
    weighting = this.forename === 'John' ? 2 : 3;
    return {
        resource: 'f_nested_schema',
        resourceText: 'Exams',
        id: this._id,
        weighting: weighting,
        text: this.surname + (this.forename ? ', ' + this.forename : '')
    };
};
FSchema.statics.form = function (layout) {
    var formSchema = '';
    switch (layout) {
        case 'English':
            // Just the English exam from the array
            formSchema = {
                surname: {},
                forename: {},
                exams: { subkey: { keyList: { subject: 'English' }, containerType: 'well', title: 'English Exam' } }
            };
            break;
        case 'EnglishAndMaths':
            // English and Maths exams from the array
            formSchema = {
                surname: {},
                forename: {},
                exams: { subkey: [
                        { keyList: { subject: 'English' }, containerType: 'well', title: 'English Exam' },
                        { keyList: { subject: 'Maths' }, containerType: 'well', title: 'Maths Exam' }
                    ] }
            };
            break;
        case 'ResultsOnly':
            // English and Maths exams from the array
            formSchema = {
                surname: {},
                forename: {},
                exams: { schema: {
                        subject: {},
                        result: { label: 'Outcome' }
                    } }
            };
            break;
        case 'EnglishPaper':
            formSchema = {
                surname: {},
                forename: {},
                exams: {
                    subkey: {
                        keyList: { subject: 'English' },
                        containerType: 'well',
                        title: 'English Exam'
                    },
                    schema: {
                        examDate: {}, score: {}, result: {},
                        scan: { hidden: false }
                    }
                }
            };
            break;
    }
    return formSchema;
};
module.exports = {
    model: F,
    options: {
        searchResultFormat: F.prototype.searchResultFormat
    }
};
//# sourceMappingURL=f_nested_schema.js.map