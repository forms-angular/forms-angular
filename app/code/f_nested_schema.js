var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ExamsSchema = new Schema({
    subject: String,
    examDate: Date,
    score: Number,
    result: {type: String, enum:['distinction','merit','pass','fail']},
    grader: { type: Schema.Types.ObjectId, ref: 'b_using_options'}
});

var FSchema = new Schema({
    surname: {type: String, index:true, list:{}},
    forename:  {type: String, index:true, list:true},
    exams: {type: [ExamsSchema], form:{noAdd: true, noRemove: true}}
});

var F = mongoose.model('F', FSchema);

F.prototype.searchResultFormat = function() {

    // You can set up a function to modify search result display and the
    // ordering within a collection
    var weighting;

    weighting = this.forename === 'John' ? 1 : 3;

    return {
        resource: 'f_nested_schema',
        resourceText: 'Exams',
        id: this._id,
        weighting: weighting,
        text: this.surname + ', ' + this.forename
    }
}


module.exports = {
    model : F,
    searchResultFormat: F.prototype.searchResultFormat
};


