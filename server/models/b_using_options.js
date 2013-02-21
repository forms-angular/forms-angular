var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BSchema = new Schema({
    surname: {type: String, list:{}},                        // this field appears in a listing and the default edit form header
    forename:  {type: String, list:true},                    // this field appears in a listing and the default edit form header
    address: {
        line1: {type: String, form:{label: 'Address'}},      // this label overrides the one generated from the field name
        line2: {type: String, form:{label: null}},           // null - gives a blank label
        line3: {type: String, form:{label: null}},
        town: {type: String, form:{label: 'Town'}},
        postcode: {type: String, form:{label: 'Postcode'}}
    },
    weight: {type : Number, form:{label:"Weight (lbs)"}},    // this label overrides the one generated from the field name
    dateOfBirth: Date,
    accepted: Boolean,
    interviewScore:{type:Number,form:{hidden:true},list:{}}  // this field does not appear on the form or listings, even though list is defined - not sure about this
});

var B = mongoose.model('B', BSchema);

module.exports = B;
