var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

function fngHierarchy(schema, options) {
    schema.add({
        fngh_elementNo: {type: Number, required: true, form:{ hidden: true}},
        fngh_parent: { type: Number, form: {hidden: true} },
        fngh_displayStatus: {type: Boolean, form: {hidden: true}},
        fngh_order: {type: Number, form: {hidden: true}},
        fngh_isContainer: {type: Boolean, form:{popup:"Is this a container?", order:0}}
    });
}

module.exports = fngHierarchy;