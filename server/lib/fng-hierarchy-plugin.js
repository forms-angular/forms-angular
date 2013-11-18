var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

function fngHierarchy(schema, options) {
    schema.add({
        elementNo: {type: Number, required: true, form:{ hidden: true}},
        parent: { type: Number, form: {hidden: true} },
        displayStatus: {type: Boolean, form: {hidden: true}},
        order: {type: Number, form: {hidden: true}},
        isContainer: {type: Boolean, form:{popup:"Is this a container?", order:0}}
    });
}

module.exports = fngHierarchy;