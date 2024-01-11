"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var ExamSchemaDef = {
    subject: String,
    examDate: { type: Date, form: { size: 'small' } },
    result: { type: String, enum: ['distinction', 'merit', 'pass', 'fail'] },
    grader: { type: mongoose_1.Schema.Types.ObjectId, ref: 'b_enhanced_schema', form: { directive: 'fng-ui-select', fngUiSelect: { fngAjax: true }, label: 'Marked By' } },
    retakeDate: { type: Date, form: { showWhen: { lhs: '$exams.result', comp: 'eq', rhs: 'fail' } } }
};
var ExamsSchema = new mongoose_1.Schema(ExamSchemaDef, { _id: false });
var GSchemaDef = {
    surname: { type: String, list: {}, index: true },
    forename: { type: String, list: true, index: true },
    sex: { type: String, enum: ['F', 'M'] },
    accepted: { type: Boolean, form: { help: 'When someone is accepted additional fields appear' } },
    startDate: { type: Date, form: { showIf: { lhs: '$accepted', comp: 'eq', rhs: true } } }, // This syntax is is heading towards deprecation - use showWhen
    startingPosition: { type: String, form: { showWhen: { lhs: '$accepted', comp: 'eq', rhs: true } } },
    bribeAmount: { type: Number, form: { help: 'Try a number between 10 and 200 to see an angular expression used in a conditional' } },
    loggedInBribeBook: { type: Boolean, form: { showWhen: 'record.bribeAmount >= 10 && record.bribeAmount <= 200' } },
    exams: { type: [ExamsSchema], form: { formStyle: 'inline' } }
};
var GSchema = new mongoose_1.Schema(GSchemaDef);
var G;
try {
    G = (0, mongoose_1.model)('g_conditional_field');
}
catch (e) {
    G = (0, mongoose_1.model)('g_conditional_field', GSchema);
}
GSchema.statics.report = function (report) {
    var reportSchema = '', fullDescription = { field: '_id', translations: [{ value: 'M', display: 'Male' }, { value: 'F', display: 'Female' }, { 'value': '', 'display': 'Unspecified' }] };
    switch (report) {
        case 'breakdownbysex':
            reportSchema = {
                pipeline: [
                    { $group: { _id: '$sex', count: { '$sum': 1 } } },
                    { $sort: { _id: 1 } }
                ],
                title: 'Numbers of Applicants By Sex',
                columnDefs: [
                    { field: '_id', displayName: 'Sex', totalsRow: 'Total', 'width': '160px' },
                    { field: 'count', displayName: 'No of Applicants', totalsRow: '$SUM', 'width': '160px', 'cellFilter': 'number', 'align': 'right' }
                ],
                columnTranslations: [fullDescription]
            };
            break;
        case 'totalforonesex':
            reportSchema = {
                'pipeline': [
                    { '$match': { 'sex': '(sex)' } },
                    { '$group': { '_id': '$sex', 'count': { '$sum': 1 } } }
                ],
                'title': 'Numbers of Applicants By Sex',
                'columnDefs': [
                    { 'field': '_id', 'displayName': 'Sex', 'width': '200' },
                    { 'field': 'count', 'displayName': 'No of Applicants', 'align': 'right', 'width': '200' }
                ],
                'columnTranslations': [fullDescription],
                'params': { 'sex': { value: 'M', type: 'select', enum: ['Male', 'Female'], required: true, conversionExpression: 'param[0]' } }
            };
            break;
        case 'totals':
            reportSchema = {
                'pipeline': [
                    { '$project': { 'surname': 1, 'forename': 1, 'bribeAmount': 1, '_id': 1 } }
                ],
                'title': 'A report with totals and drilldown',
                drilldown: 'g_conditional_field/|_id|/edit',
                'columnDefs': [
                    { 'field': 'surname', 'displayName': 'Surname', 'width': '200', totalsRow: 'Total' },
                    { 'field': 'forename', 'displayName': 'Forename', 'width': 200 },
                    { 'field': 'bribeAmount', 'displayName': 'Bribe', 'align': 'right', 'width': '200', totalsRow: '$SUM', 'cellFilter': 'currency' }
                ]
            };
            break;
        case 'functiondemo':
            reportSchema = {
                'pipeline': [
                    { '$group': { '_id': '$sex', 'count': { '$sum': 1 }, 'functionResult': { '$sum': 1 } } }
                ],
                'title': 'Numbers of Applicants By Sex',
                'columnDefs': [
                    { 'field': '_id', 'displayName': 'Sex', 'width': '200' },
                    { 'field': 'count', 'displayName': 'No of Applicants', 'align': 'right', 'width': '200' },
                    { 'field': 'functionResult', 'displayName': 'Applicants + 10', 'align': 'right', 'width': '200' }
                ],
                'columnTranslations': [fullDescription,
                    { field: 'functionResult',
                        fn: function (row, cb) {
                            row.functionResult = row.functionResult + 10;
                            cb();
                        } }
                ]
            };
            break;
        case 'selectbynumber':
            reportSchema = {
                'pipeline': [
                    { '$group': { '_id': '$sex', 'count': { '$sum': 1 } } },
                    { '$match': { 'count': '(number_param)' } }
                ],
                'params': { 'number_param': { value: 11, type: 'number', required: true } }
            };
            break;
    }
    return reportSchema;
};
module.exports = {
    model: G,
    options: {
        searchImportance: 1,
        searchOrder: { surname: 1 },
        listOrder: { surname: 1 }
    }
};
//    "pipeline":[{"$group":{"_id":"$sex","count":{"$sum":1}}},{"$match":{"count":"(number_param)"}}],"params":{"number_param":11}
//# sourceMappingURL=g_conditional_field.js.map