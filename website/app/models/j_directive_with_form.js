"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var FriendSchemaDef = {
    friend: { type: mongoose_1.Schema.Types.ObjectId, ref: 'a_unadorned_schema' },
    type: { type: String, enum: ['best friend', 'partner', 'colleague', 'acquaintance', 'other'] },
    comment: { type: String }
};
var FriendSchema = new mongoose_1.Schema(FriendSchemaDef, { _id: false });
var JSchemaDef = {
    surname: { type: String, required: true, list: {} },
    forename: { type: String, list: true },
    friendList: { type: [FriendSchema], form: { directive: 'friends' } }
};
var JSchema = new mongoose_1.Schema(JSchemaDef);
var J;
try {
    J = mongoose_1.model('j_directive_with_form');
}
catch (e) {
    J = mongoose_1.model('j_directive_with_form', JSchema);
}
module.exports = {
    model: J
};
//# sourceMappingURL=j_directive_with_form.js.map