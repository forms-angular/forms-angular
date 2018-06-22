import { Schema, model } from "mongoose";
import { IFngSchemaDefinition } from "../../../src/fng-schema";

const CourseTeachersSchemaDef: IFngSchemaDefinition = {
  teacher: { type: Schema.Types.ObjectId, ref:{type:'lookup', collection:'b_enhanced_schema'}},
  room: Number
};

const CourseTeachersSchema = new Schema(CourseTeachersSchemaDef);

const ExamsSchemaDef: IFngSchemaDefinition = {
  subject: { type: String},
  examDate: Date,
  score: Number,
  result: {type: String, enum: ['distinction', 'merit', 'pass', 'fail']},
  grader: { type: Schema.Types.ObjectId, ref:{type:'lookup', collection:'b_enhanced_schema'}}
};

const ExamsSchema = new Schema(ExamsSchemaDef);

const CourseSchemaDef: IFngSchemaDefinition = {
  subject: String,
  grade: {type: String},
  teachers: [CourseTeachersSchema]
};

const CourseSchema = new Schema(CourseSchemaDef);

const HSchemaDef: IFngSchemaDefinition = {
  surname: {type: String, list: {}},
  forename: {type: String, list: true},
  address: {
    street: String,
    town: String
  },
  studies: {
    courses: {type: [CourseSchema], form: {noRemove: true}},
    exams: [ExamsSchema]
  },
  assistants: [
    { type: Schema.Types.ObjectId, ref:{type:'lookup', collection:'b_enhanced_schema'}}
  ]
};

const HSchema = new Schema(HSchemaDef);

let H;
try {
  H = model('h_deep_nesting');
} catch (e) {
  H = model('h_deep_nesting', HSchema);
}

module.exports = {
  model: H
};

