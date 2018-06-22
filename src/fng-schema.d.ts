// TODO: subkeys etc, return types of statics.form & statics.report

import { Schema, SchemaType, SchemaTypeOpts } from "mongoose";

  /*
  Type definitions for types that are used on both the client and the server
   */

  export interface IFngLookupReference {
    type: 'lookup';
    collection: string
  }

  /*
  IInternalLookupreference makes it possible to look up from a list (of key / value pairs) in the current record.  For example

  var ShelfSchema = new Schema({
    location: {type: String, required: true}
  });  // Note that this schema needs an _id as it is an internal lookup

  var ESchema = new Schema({
    warehouse_name: {type: String, list: {}},
    shelves: {type: [ShelfSchema]},
    favouriteShelf: {type: Schema.Types.ObjectId, ref: {type: 'internal', property: 'shelves', value:'location'};
  });
   */
  export interface IFngInternalLookupReference {
    type: 'internal';
    property: string;
    value: string;
  }

  /*
  showWhen allows conditional display of fields based on values elsewhere.

  For example having prompted whether someone is a smoker you may want a field asking how many they smoke a day:
    smoker: {type: Boolean},
    howManyPerDay: {type: Number, form:{showWhen:{lhs:"$smoker", comp:"eq", rhs:true}}}

  As you can see from the example there are three parts to the showIf object:

  lhs (left hand side) a value to be compared. To use the current value of another field in the document preceed it with $.
  comp supported comparators are 'eq' for equality, 'ne' for not equals, 'gt' (greater than), 'gte' (greater than or equal to),
  'lt' (less than) and 'lte' (less than or equal to)
  rhs (right hand side) the other value to be compared. Details as for lhs.
   */
  export interface IFngShowWhen {
    lhs: any;
    comp: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';
    rhs: any;
  }

  /*
  link allows the setting up of hyperlinks for lookup reference fields
  */
  export interface IFngLinkSetup {
    linkOnly?: boolean;  // if true (which at the time of writing is the only option supported) then the input element is not generated.
    form?: string;    // can be used to generate a link to a custom schema
    text?: string;   // the literal value used for the link. If this property is omitted then text is generated from the field values of the document referred to by the link.
  }

  export interface IFngSchemaTypeFormOpts {
    /*
      The input type to be generated - which must be compatible with the Mongoose type.
      Common examples are email, url.

      In addition to the standard HTML5 types there are some 'special' types:
        textarea: a textarea control
        radio: a radio button control
        select: a select control

      Note that if the field type is String and the name (or label) contains the string
      'password' then type="password" will be used unless type="text".

      If the Mongoose schema has an enum array you can specify a radio button group
      (instead of a select) by using a type of radio
     */
    type?: string;

    hidden?: boolean;   // inhibits this schema key from appearing on the generated form.
    label?: string | null;   // overrides the default input label. label:null suppresses the label altogether.
    ref?: IFngLookupReference | IFngInternalLookupReference;


    id?: string; // specifies the id of the input field (which defaults to f_name)


    placeHolder?: string // adds placeholder text to the input (depending on data type).
    help?: string;  // adds help text under the input.
    helpInline?: string;  // adds help to the right of the input.
    popup?: string;  // adds popup help as specified.
    order?: number;  // allows user to specify the order / tab order of this field in the form. This overrides the position in the Mongoose schema.
    size?: 'mini' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'block-level';  // sets control width.  Default is 'medium''
    readonly?: boolean;  // adds the readonly attribute to the generated input (currently doesn't work with date - and perhaps other types).
    rows?: number | 'auto';  // sets the number of rows in inputs (such as textarea) that support this. Setting rows to "auto" makes the textarea expand to fit the content, rather than create a scrollbar.
    tab?: string;  // Used to divide a large form up into a tabset with multiple tabs
    showWhen?: IFngShowWhen | string;  // allows conditional display of fields based on values elsewhere.  string must be an abular expression.

    /*
      add: 'class="myClass"' allows custom styling of a specific input
    Angular model options can be used - for example add: 'ng-model-options="{updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 }}" '
    custom validation directives, such as the timezone validation in this schema
    */
    add?: string;    //  allows arbitrary attributes to be added to the input tag.

    class?: string;  // allows arbitrary classes to be added to the input tag.
    inlineRadio?: boolean;  // (only valid when type is radio) should be set to true to present all radio button options in a single line
    editor?: string; // (only valid when type is textarea) should be set to ckEditor to use CKEditor
    link?: IFngLinkSetup; // handles displaying links for IFngLookupReference lookups

    /*
      With a select / radio type you can specify the options.
      You can either do this by putting the option values in an array and passing it directly, or by putting them in an
      array on the scope and passing the name of the array (which allows run-time modification
     */
    options?: Array<string> | string;

    /* Directive allows you to specify custom behaviour.

     Gets passed attributes from form-input (with schema replaced with the current element - so add can be used to pass data into directives).
     */
    directive?: string;
    /* Inhibits the forms-angular client from looking up the possible values for a
      IFngLookupReference or IFngInternalLookupReference field
      (when a directive has a an alternative way of handling things)
     */
    noLookup?: boolean;

    /*
    The next few options relate to the handling and display of arrays (including arrays of subdocuments)
     */
    noAdd?: boolean; // inhibits an Add button being generated for arrays.
    unshift?: boolean; // (for arrays of sub documents) puts an add button in the sub schema header which allows insertion of new sub documents at the beginning of the array.
    noRemove?: boolean;  // inhibits a Remove button being generated for array elements.
    formstyle?: 'inine' | 'vertical' | 'horizontal' | 'horizontalCompact';  // (only valid on a sub schema) sets style of sub form.
    sortable? : boolean;  // Allows drag and drop sorting of arrays - requires angular-ui-sortable

    /*
    The next section relates to the display of sub documents
     */
    customSubDoc?: string; // Allows you to specify custom HTML (which may include directives) for the sub doc
    customFooter?: string; // Allows you to specify custom HTML (which may include directives) for the footer of a group of sub docs
  }

  /*
  A 'list' attribute, or maybe a 'key' attribute, is one that can be generally used to identify a document.

  For example in a person collection, firstName and lastName would be (perhaps sufficient) list items.

  They are used when generating lists in the default forms, and generating options for selects when referencing another
  collection.
   */

  export interface IFngSchemaTypesOpts<T> extends SchemaTypeOpts<T> {
    secure?: boolean;     // // secure prevents the data from being sent by the API
    list?: {} | true;
    form?: IFngSchemaTypeFormOpts;
  }

  export interface IFngSchemaDefinition {
    [path: string]: IFngSchemaTypesOpts<any> | Schema | SchemaType;
  }
