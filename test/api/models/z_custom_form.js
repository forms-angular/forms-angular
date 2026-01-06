
import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var ZSchema = new Schema({
  surname: {type: String, index: true},
  forename: String,
  weight: Number,
  dateOfBirth: Date,
  termsAccepted: Boolean
});

var Z;
try {
  Z = mongoose.model('Z');
} catch (e) {
  Z = mongoose.model('Z', ZSchema);
}

export default Z;
