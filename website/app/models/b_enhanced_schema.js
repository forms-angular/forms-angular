'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var jqUploads = require('fng-jq-upload');

var BSchema = new Schema({
  photo: {type: [new Schema(jqUploads.FileSchema)], form: {directive: 'fng-jq-upload-form', fngJqUploadForm:{autoUpload:true, sizeLimit:256 * 1024, single:true, width: 100, height: 100}}},
  surname: {type: String, required: true, index: true, list: {}}, // this field appears in a listing and the default edit form header
  forename: {type: String, list: true, index: true},        // this field appears in a listing and the default edit form header
  website: {type: String, form: {type: 'url'}},
  login: {type: String, secure: true, form: {hidden: true}},  // secure prevents the data from being sent by the API, hidden from being shown on the default form
  passwordHash: {type: String, secure: true, form: {hidden: true}},
  address: {
    line1: {type: String, form: {label: 'Address'}},      // this label overrides the one generated from the field name
    line2: {type: String, form: {label: null}},           // null label - gives a blank label
    line3: {type: String, form: {label: null, add: 'random attributes', class : 'some classes here'}},
    town: {type: String, form: {label: 'Town', placeHolder: 'Post town'}},          // You can specify place holders
    postcode: {type: String,
      match: /^(GIR 0AA|[A-Z]{1,2}[0-9][0-9A-Z]? [0-9][ABD-HJLNP-UW-Z]{2})$/,
      form: {label: 'Postcode', size: 'small', help: 'Enter your UK postcode (for example TN2 1AA)'}},  // help displays on the line under the control, size adds matching bootstrap input- class
    country: {type: String, form: {label: 'Country', hidden: true}},
    surveillance: {type: Boolean, secure: true, form: {hidden: true}}
  },

  // The email field is indexed, but the noSearch property means the index is not used in the searchBox searches
  // A use case for this would be an index that is used in reports for grouping which has no meaning in a search.
  //
  // The field has a custom directive to prepend (which is defined in /app/demo/directives/bespoke-field.js)
  email: {type: String, index: true, noSearch: true, form: {directive: 'email-field'}},
  weight: {type: Number, min: 5, max: 300, form: {label: 'Approx Weight (lbs)',  // this label overrides the one generated from the field name
    step: 5}},                         // input uses the min and max from the Mongoose schema, and the step from the form object

  hairColour: {
    type: String,
    enum: ['Black', 'Blond', 'Brown', 'Fair', 'Grey', 'What hair?'],
    required: false,
    form: {
      directive: 'fng-ui-select',
      placeHolder: 'Choose hair colour...',
      help:'This controller uses the <a href="https://github.com/forms-angular/fng-ui-select">fng-ui-select plugin</a> which pulls in the <a href="https://github.com/angular-ui/ui-select">angular-ui ui-select component</a>.'
    }
  },
  sex: {type: String, enum: ['Male', 'Female'], form: {type: 'radio', inlineRadio: true}},

  // Set timezone to UTC for date of birth and other 'floating' date times
  dateOfBirth: {type: Date, form: {helpInline: 'When is their birthday?', add: ' ng-model-options="{timezone:\'UTC\'}"'}},
  applicationReceived: {type: Date, form: {helpInline: 'This uses fng-bootstrap-date plugin', directive:"fng-ui-bootstrap-date-picker", fngUiBootstrapDatePicker: {format: 'dd MMM yyyy', "ng-model-options":"{timezone:\'UTC\'}" }}},
  education: {type: String, enum: {values:['sec', 'univ', 'mas', 'dr'], labels:['Secondary', 'University', 'Masters', 'Doctorate']}, form: {type: 'radio'}},
  CV: {type: [new Schema(jqUploads.FileSchema)], form: {help:'Attach the CV - maximumm size 0.5MB', directive: 'fng-jq-upload-form', fngJqUploadForm:{single:true, autoUpload: true, sizeLimit:524288}}},
  accepted: {type: Boolean, required: true, form: {
    help: 'This control has had an event handler added to it (which looks horrid - sorry!).' +
    '  See post form-input generation processing section of <a ng-href="{{buildUrl(\'forms#client-side-customisation\')}}">documentation</a> for details.'
  }, list: {}},   // helpInline displays to the right of the input control
  favouriteColour: {type: String, form:{directive:'fng-colour-picker'}},
  timezone: {type: String, form:{add: ' timezone', help:'This field uses <a href="https://docs.angularjs.org/guide/forms#custom-validation" target="_blank">custom validation</a> from <a href="/scripts/directives/timezone.js" target="_blank">this directive</a>.  Timezone example is <strong>Europe/London</strong>'}},
  interviewDate: {type: Date, form:{helpInline: 'This uses fng-bootstrap-datetime plugin. Bootstrap 2 looks poor - 3 is fine.', directive: 'fng-ui-bootstrap-datetime-picker', fngUiBootstrapDatetimePicker:{'date-format': 'dd-MMM-yyyy', 'date-options':"{'show-weeks':true}"}}},
  interviewScore: {type: Number, form: {hidden: true}, list: {}},  // this field does appear on listings, even though it is hidden on default form
  interviewForms: {type: [new Schema(jqUploads.FileSchema)], form: {help:'Attach the scans of the interview forms - maximumm size 0.5MB', directive: 'fng-jq-upload-form', fngJqUploadForm:{autoUpload:true, sizeLimit:524288}}},
  freeText: {
    type: String,
    form: {
      type: 'textarea',
      rows: 5,
      help: 'There is some validation on this field to ensure that the word "rude" is not entered.  Try it to see the record level error handling.'
    }
  },
  resizingText: {type: String, form: {type: 'textarea', rows: 'auto', help: 'This field resizes thanks to the <a href="http://monospaced.github.io/angular-elastic/">angular-elastic</a> module'}},
  formattedText: {
    type: String,
    form: {
      type: 'textarea',
      editor: 'ckEditor',
      help: 'This field uses <a href="http://ckeditor.com">CKEditor</a> and the <a href="https://github.com/esvit/ng-ckeditor">ng-ckeditor</a> module'
    }
  },
  ipAddress: {type: String, form: {hidden: true}},
  //any field containing password will display as a password field (dots).
  // This can be overidden by adding 'form:{password:false}' - also this can be true if the field is NOT called password
  password: {type: String}
});

BSchema.pre('save', function (next) {
  // Check for rude words (well, the word "rude", actually) to show an error

  if (this.freeText && this.freeText.indexOf('rude') !== -1) {
    return next(new Error('Wash your mouth!  You must not use rude words.'));
  }
  return next();
});

var B;
try {
  B = mongoose.model('b_enhanced_schema');
} catch (e) {
  B = mongoose.model('b_enhanced_schema', BSchema);
}

// Alternative form schemas can be defined as shown below
BSchema.statics.form = function (layout) {
  var formSchema = '';
  switch (layout) {
    case 'justnameandpostcode' :
      // the object overrides the form object in the schema
      formSchema = {
        surname: {label: 'Family Name'},
        'address.postcode': {},
        accepted: {},
        'address.country': {hidden: false}
      };
      break;
    case 'ipAddress' :   // used in testing
      formSchema = {
        ipAddress: {hidden: false}
      };
      break;

  }
  return formSchema;
};

BSchema.statics.findAccepted = function (req, cb) {
  // Only show the accepted items
  cb(null, {accepted: true});
};

BSchema.statics.prepareSave = function (doc, req, cb) {
  doc.ipAddress = req.ip;
  cb(null);
};

BSchema.statics.report = function (report) {
  var reportSchema = '';
  switch (report) {
    case 'allVisible' :
      reportSchema = {
        pipeline: [
          {$group: {_id: '$accepted', count: {'$sum': 1}}}
        ],
        title: 'Numbers of Applicants By Status'
      };
      break;
  }
  return reportSchema;
};

module.exports = {
  model: B,                                          // pass the model in an object if you want to add options
  options: {
//    idIsList: {params:'timestamp'},
    findFunc: BSchema.statics.findAccepted,            // this can be used to 'pre' filter selections.
    // A common use case is to restrict a user to only see their own records
    // as described in https://groups.google.com/forum/?fromgroups=#!topic/mongoose-orm/TiR5OXR9mAM
    onSave: BSchema.statics.prepareSave                // a hook that can be used to add something from environment to record before update
  }
};
