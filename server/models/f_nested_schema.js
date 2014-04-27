'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ExamsSchema = new Schema({
    subject: String,
    examDate: Date,
    score: Number,
    result: {type: String, enum:['distinction','merit','pass','fail']},
    grader: { type: Schema.Types.ObjectId, ref: 'b_using_options', form:{select2:{fngAjax:true}}},
    retakeDate: {type: Date, form:{showWhen:{lhs:'$exams.result', comp:'eq', rhs:'fail'}}}
}, {_id: false});

var FSchema = new Schema({
    surname: {type: String, index:true, list:{}},
    forename:  {type: String, index:true, list:true},
    aTest: { type: Schema.Types.ObjectId, ref: 'b_using_options'},

//    exams: [ExamsSchema]    // defaults to horizontal compact form
    // or
    exams: {type:[ExamsSchema], form:{formStyle: 'inline'}}
});

var F;
try {F = mongoose.model('F');} catch(e) {F = mongoose.model('F', FSchema);}

F.prototype.searchResultFormat = function() {

    // You can set up a function to modify search result display and the
    // ordering within a collection
    var weighting;

    weighting = this.forename === 'John' ? 2 : 3;

    return {
        resource: 'f_nested_schema',
        resourceText: 'Exams',
        id: this._id,
        weighting: weighting,
        text: this.surname + ', ' + this.forename
    };
};

FSchema.statics.form = function(layout) {
    var formSchema = '';
    switch (layout) {
        case 'English' :
            // Just the English exam from the array
            formSchema = {
                surname: {},
                forename:  {},
                exams: {subkey:{keyList:{subject:'English'}, containerType:'well', title:'English Exam'}}
            };
            break;
        case 'EnglishAndMaths' :
            // English and Maths exams from the array
            formSchema = {
                surname: {},
                forename:  {},
                exams: {subkey:[{keyList:{subject:'English'}, containerType:'well', title:'English Exam'},{keyList:{subject:'Maths'}, containerType:'well', title:'Maths Exam'}]}
            };
            break;
    }
    return formSchema;
};

module.exports = {
    model : F,
    searchResultFormat: F.prototype.searchResultFormat
};


