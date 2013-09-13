var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ESchema = new Schema({
    surname: {type: String, list:{}},
    forename:  {type: String, list:true},
    weight: {type : Number, form:{label:"Weight (lbs)"}},
    teacher: { type: Schema.Types.ObjectId, ref: 'b_using_options', form:{select2:true}},
    dateOfBirth: Date,
    accepted: Boolean,
    assistants: [{ type: Schema.Types.ObjectId, ref: 'a_unadorned_mongoose'}]
});

var E;
try {E = mongoose.model('E') } catch(e) {E = mongoose.model('E', ESchema)}

ESchema.statics.report = function(report) {
    var reportSchema = '';
    switch (report) {
        case 'class-sizes' :
            reportSchema = {
                pipeline: [{$group:{_id:"$teacher",count:{"$sum":1}}}],
                title: "Class Sizes",
                columnDefs: [{field:'_id', displayName:'Teacher'}, {field:'count', displayName:'Number in Class'}]
            };
            break;
    }
    return reportSchema;
};

module.exports = E;


