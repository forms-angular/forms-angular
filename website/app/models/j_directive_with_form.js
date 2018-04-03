'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FriendSchema = new Schema({
  friend: { type: Schema.Types.ObjectId, ref: 'a_unadorned_schema'},
  type: { type: String, enum: ['best friend', 'partner', 'colleague', 'acquaintance', 'other']},
  comment: { type: String}
}, {_id: false});

var JSchema = new Schema({
  surname: {type: String, required: true, list: {}},
  forename: {type: String, list: true},
  friendList: {type: [FriendSchema], form: {directive: 'friends'}}
});

var J;
try {
  J = mongoose.model('j_directive_with_form');
} catch (e) {
  J = mongoose.model('j_directive_with_form', JSchema);
}

module.exports = {
  model: J
};

