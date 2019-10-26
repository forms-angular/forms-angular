"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FriendSchemaDef = {
    friend: { type: mongoose_1.Schema.Types.ObjectId, ref: 'a_unadorned_schema' },
    type: { type: String, enum: ['best friend', 'partner', 'colleague', 'acquaintance', 'other'] },
    comment: { type: String }
};
const FriendSchema = new mongoose_1.Schema(FriendSchemaDef, { _id: false });
const JSchemaDef = {
    surname: { type: String, required: true, list: {} },
    forename: { type: String, list: true },
    friendList: { type: [FriendSchema], form: { directive: 'friends' } }
};
const JSchema = new mongoose_1.Schema(JSchemaDef);
let J;
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