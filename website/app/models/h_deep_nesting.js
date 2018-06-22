"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var CourseTeachersSchemaDef = {
    teacher: { type: mongoose_1.Schema.Types.ObjectId, ref: { type: 'lookup', collection: 'b_enhanced_schema' } },
    room: Number
};
var CourseTeachersSchema = new mongoose_1.Schema(CourseTeachersSchemaDef);
var ExamsSchemaDef = {
    subject: { type: String },
    examDate: Date,
    score: Number,
    result: { type: String, enum: ['distinction', 'merit', 'pass', 'fail'] },
    grader: { type: mongoose_1.Schema.Types.ObjectId, ref: { type: 'lookup', collection: 'b_enhanced_schema' } }
};
var ExamsSchema = new mongoose_1.Schema(ExamsSchemaDef);
var CourseSchemaDef = {
    subject: String,
    grade: { type: String },
    teachers: [CourseTeachersSchema]
};
var CourseSchema = new mongoose_1.Schema(CourseSchemaDef);
var HSchemaDef = {
    surname: { type: String, list: {} },
    forename: { type: String, list: true },
    address: {
        street: String,
        town: String
    },
    studies: {
        courses: { type: [CourseSchema], form: { noRemove: true } },
        exams: [ExamsSchema]
    },
    assistants: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: { type: 'lookup', collection: 'b_enhanced_schema' } }
    ]
};
var HSchema = new mongoose_1.Schema(HSchemaDef);
var H;
try {
    H = mongoose_1.model('h_deep_nesting');
}
catch (e) {
    H = mongoose_1.model('h_deep_nesting', HSchema);
}
module.exports = {
    model: H
};
//# sourceMappingURL=h_deep_nesting.js.map