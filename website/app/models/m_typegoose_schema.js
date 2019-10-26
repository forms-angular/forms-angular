"use strict";
/*
  This is the typegoose (https://github.com/typegoose/typegoose) equivalent of a_unadorned_schema
  Would require considerable extension of typegoose to do anything beyond this though
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typegoose_1 = require("@typegoose/typegoose");
var EyeColour;
(function (EyeColour) {
    EyeColour["BLUE"] = "Blue";
    EyeColour["BROWN"] = "Brown";
    EyeColour["GREEN"] = "Green";
    EyeColour["HAZEL"] = "Hazel";
})(EyeColour || (EyeColour = {}));
let MTypegooseSchema = class MTypegooseSchema {
};
__decorate([
    typegoose_1.prop({ required: true }),
    __metadata("design:type", String)
], MTypegooseSchema.prototype, "surname", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], MTypegooseSchema.prototype, "forename", void 0);
__decorate([
    typegoose_1.prop({ required: true, validate: /^\d{10,12}$/ }),
    __metadata("design:type", String)
], MTypegooseSchema.prototype, "phone", void 0);
__decorate([
    typegoose_1.prop({ default: 'European' }),
    __metadata("design:type", String)
], MTypegooseSchema.prototype, "nationality", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Number)
], MTypegooseSchema.prototype, "weight", void 0);
__decorate([
    typegoose_1.prop({ required: true, enum: EyeColour }),
    __metadata("design:type", String)
], MTypegooseSchema.prototype, "eyeColour", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Date)
], MTypegooseSchema.prototype, "dateOfBirth", void 0);
__decorate([
    typegoose_1.prop({ default: true }),
    __metadata("design:type", Boolean)
], MTypegooseSchema.prototype, "accepted", void 0);
MTypegooseSchema = __decorate([
    typegoose_1.index({ surname: 1 }),
    typegoose_1.index({ forename: 1 })
], MTypegooseSchema);
exports.MTypegooseSchema = MTypegooseSchema;
const TypegooseModel = typegoose_1.getModelForClass(MTypegooseSchema); // TypegooseModel is a regular Mongoose Model with correct types
// So now we can use type checking, but only on the server
let test = new MTypegooseSchema();
test.surname = 'Smith';
module.exports = {
    model: TypegooseModel
};
//# sourceMappingURL=m_typegoose_schema.js.map