'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ESchema = new Schema({
    surname: {type: String, list:{}},
    forename:  {type: String, list:true},
    weight: {type : Number, form:{label:'Weight (lbs)'}},
    mentor: { type: Schema.Types.ObjectId, ref: 'c_subdoc_example'},
    teacher: { type: Schema.Types.ObjectId, ref: 'b_using_options', form:{select2:true}},
    dateOfBirth: Date,
    assistants: [{ type: Schema.Types.ObjectId, ref: 'a_unadorned_mongoose'}],
    team: [{ type: Schema.Types.ObjectId, ref: 'd_array_example', form:{select2:true}}],
    accepted: Boolean
});

var E;
try {E = mongoose.model('E');} catch(e) {E = mongoose.model('E', ESchema);}

ESchema.statics.report = function(report) {
    var reportSchema = '';
    switch (report) {
        case 'class-sizes' :
            reportSchema = {
                pipeline: [{$group:{_id:'$teacher',count:{'$sum':1}}}],
                title: 'Class Sizes',
                columnDefs: [{field:'_id', displayName:'Teacher'}, {field:'count', displayName:'Number in Class'}],
                columnTranslations: [{field:'_id', ref: 'b_using_options'}]
            };
            break;
    }
    return reportSchema;
};

module.exports = E;


