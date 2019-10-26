"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CourseTeachersSchemaDef = {
    teacher: { type: mongoose_1.Schema.Types.ObjectId, ref: 'b_enhanced_schema' },
    room: Number
};
const CourseTeachersSchema = new mongoose_1.Schema(CourseTeachersSchemaDef);
const ExamsSchemaDef = {
    subject: { type: String },
    examDate: Date,
    score: Number,
    result: { type: String, enum: ['distinction', 'merit', 'pass', 'fail'] },
    grader: { type: mongoose_1.Schema.Types.ObjectId, ref: 'b_enhanced_schema' }
};
const ExamsSchema = new mongoose_1.Schema(ExamsSchemaDef);
const CourseSchemaDef = {
    subject: String,
    grade: { type: String },
    teachers: [CourseTeachersSchema]
};
const CourseSchema = new mongoose_1.Schema(CourseSchemaDef);
const HSchemaDef = {
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
        { type: mongoose_1.Schema.Types.ObjectId, ref: 'b_enhanced_schema' }
    ]
};
const HSchema = new mongoose_1.Schema(HSchemaDef);
let H;
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