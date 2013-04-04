var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BSchema = new Schema({
    surname: {type: String, required: true, list:{}},        // this field appears in a listing and the default edit form header
    forename:  {type: String, list:true},                    // this field appears in a listing and the default edit form header
    address: {
        line1: {type: String, form:{label: 'Address'}},      // this label overrides the one generated from the field name
        line2: {type: String, form:{label: null}},           // null label - gives a blank label
        line3: {type: String, form:{label: null}},
        town: {type: String, form:{label: 'Town'}},
        postcode: {type: String, form:{label: 'Postcode', help:'Enter your postcode or zip code'}},  // help displays on the line under the control
        country: {type: String, form:{label:"Country", hidden:true}}
    },
    weight: {type : Number, form:{label:"Weight (lbs)"}},    // this label overrides the one generated from the field name
    dateOfBirth: Date,
    accepted: {type: Boolean, required: true, form:{helpInline: 'Did we take them?'}, list:{}},   // helpInline displays to the right of the input control
    interviewScore:{type:Number,form:{hidden:true},list:{}},  // this field does not appear on the form or listings, even though list is defined - not sure about this
    freeText: {type: String, form:{type: 'textarea', rows:5, help:'There is some validation on this field to ensure that the word "rude" is not entered.  Try it to see the record level error handling.'}}
});

BSchema.pre('save', function(next) {
    // Check for rude words (well, the word "rude", actually) to show an error

    if (this.freeText.indexOf('rude') !== -1) {
        return next(new Error("Wash your mouth!  You must not use rude words."));
    }
    return next();
});

var B = mongoose.model('B', BSchema);

// Alternative form schemas can be defined as shown below
BSchema.statics.form = function(layout) {
    var formSchema = '';
    switch (layout) {
        case 'justnameandpostcode' :
            // the object overrides the form object in the schema
            formSchema = {
                surname:{label:"Family Name"},
                "address.postcode":{},
                "address.country": {}   // fields that are hidden by default but specified in the override schema are not hidden
            };
            break;
    }
    return formSchema;
};

BSchema.statics.findAccepted = function(req,cb) {
    // Only show the accepted items
    cb(null, B.find().where('accepted', true));
};

module.exports = {
    model : B,                                  // pass the mode in an object if you want to add options
    findFunc: BSchema.statics.findAccepted      // this can be used to 'pre' filter selections.
                                                // A common use case is to restrict a user to only see their own records
                                                // as described in https://groups.google.com/forum/?fromgroups=#!topic/mongoose-orm/TiR5OXR9mAM
};
