'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FriendSchema = new Schema({
  friend: { type: Schema.Types.ObjectId, ref: 'a_unadorned_mongoose'},
  type: { type: String, enum: ['best friend', 'partner', 'colleague', 'acquaintance', 'other']},
  comment: { type: String}
}, {_id: false});

var JSchema = new Schema({
  surname: {type: String, required: true, list: {}, index: true},
  forename: {type: String, list: true},
  friendList: {type: [FriendSchema], form: {directive: 'friends'}}
});

var J;
try {
  J = mongoose.model('J');
} catch (e) {
  J = mongoose.model('J', JSchema);
}

module.exports = J;

