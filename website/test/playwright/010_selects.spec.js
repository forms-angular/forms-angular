"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var test_1 = require("@playwright/test");
test_1.test.describe("Select", function () {
    var width = 1024;
    var height = 768;
    test_1.test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.setViewportSize({ width: width, height: height })];
                case 1:
                    _c.sent(); // Makes it easier to watch in UI
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)("should handle enums", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto("http://localhost:9000/#/b_enhanced_schema/519a6075b320153869b155e0/edit")];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page
                            .locator(".ui-select-container > .select2-choice > span.select2-chosen")
                            .last()).toHaveText(/Brown/)];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)("should handle lookups using Ajax", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto("http://localhost:9000/#/f_nested_schema/51c583d5b5c51226db418f16/edit")];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_exams_grader_0")).toContainText(/IsAccepted/)];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)("should do all the arrays in d as expected", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        function addToArray(field_1) {
            return __awaiter(this, arguments, void 0, function (field, number) {
                var addButton, i, input;
                if (number === void 0) { number = 2; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            addButton = page.locator("#add_f_".concat(field));
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < number)) return [3 /*break*/, 6];
                            return [4 /*yield*/, addButton.click()];
                        case 2:
                            _a.sent();
                            input = page.locator("#f_".concat(field, "_").concat(i));
                            return [4 /*yield*/, input.clear()];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, input.fill("".concat(field, " ").concat(i))];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            i++;
                            return [3 /*break*/, 1];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        }
        function checkArray(field_1) {
            return __awaiter(this, arguments, void 0, function (field, number) {
                var i;
                if (number === void 0) { number = 2; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < number)) return [3 /*break*/, 4];
                            return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_".concat(field, "_").concat(i))).toHaveValue("".concat(field, " ").concat(i))];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        function checkValues() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, checkArray("specialSubjects")];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, checkArray("hobbies")];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, checkArray("sports")];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_someOptions_0")).toHaveValue("Second")];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_someOptions_1")).toHaveValue("Third")];
                        case 5:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto("http://localhost:9000/#/d_array_example/new")];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, addToArray("specialSubjects")];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, addToArray("hobbies")];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, addToArray("sports")];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, page.locator("#add_f_someOptions").click()];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_someOptions_0")).toHaveClass(/ng-pristine/)];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, page.getByLabel("Some Options").selectOption("Second")];
                case 7:
                    _c.sent();
                    return [4 /*yield*/, page.locator("#add_f_someOptions").click()];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_someOptions_1")).toHaveClass(/ng-pristine/)];
                case 9:
                    _c.sent();
                    return [4 /*yield*/, page.locator("#f_someOptions_1").selectOption("Third")];
                case 10:
                    _c.sent();
                    return [4 /*yield*/, checkValues()];
                case 11:
                    _c.sent();
                    // Save the record and check they all refresh OK
                    return [4 /*yield*/, page.locator("#saveButton").click()];
                case 12:
                    // Save the record and check they all refresh OK
                    _c.sent();
                    // Handle alert
                    page.on("dialog", function (dialog) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, dialog.accept()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/d_array_example\/[0-9a-f]{24}\/edit/)];
                case 13:
                    _c.sent();
                    return [4 /*yield*/, checkValues()];
                case 14:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)("should do all the arrays in e as expected", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        function checkNonChangingValues() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_mentor")).toHaveValue("Anderson John")];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_leadMentor")).toHaveValue("Anderson John")];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_teacher a")).toContainText("IsAccepted John")];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_assistants_0")).toHaveValue("TestPerson1")];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_assistants_1")).toHaveValue("TestPerson2")];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_assistants2_0")).toHaveValue("TestPerson1")];
                        case 6:
                            _a.sent();
                            return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_assistants2_1")).toHaveValue("TestPerson2")];
                        case 7:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        function checkPreSavedValues() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, checkNonChangingValues()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        function checkPostSavedValues() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, checkNonChangingValues()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto("http://localhost:9000/#/e_referencing_another_collection/new")];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_teacher")).not.toHaveClass(/select2-allowclear/)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.getByLabel("Lead Mentor").selectOption("Anderson John")];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, page
                            .getByLabel("Mentor", { exact: true })
                            .selectOption("Anderson John")];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, page.locator("#f_teacher").getByLabel("Select box select").click()];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator("#f_teacher")).toHaveClass(/ng-valid/)];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, page.getByRole("combobox", { name: "Select box" }).fill("Is")];
                case 7:
                    _c.sent();
                    return [4 /*yield*/, page.getByText("IsAccepted John true").click()];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, page.locator("#add_f_assistants").click()];
                case 9:
                    _c.sent();
                    return [4 /*yield*/, page.getByLabel("Assistants").selectOption("TestPerson1")];
                case 10:
                    _c.sent();
                    return [4 /*yield*/, page.locator("#add_f_assistants").click()];
                case 11:
                    _c.sent();
                    return [4 /*yield*/, page.locator("#f_assistants_1").selectOption("TestPerson2")];
                case 12:
                    _c.sent();
                    return [4 /*yield*/, page.locator("#add_f_assistants2").click()];
                case 13:
                    _c.sent();
                    return [4 /*yield*/, page.getByLabel("Assistants2").selectOption("TestPerson1")];
                case 14:
                    _c.sent();
                    return [4 /*yield*/, page.locator("#add_f_assistants2").click()];
                case 15:
                    _c.sent();
                    return [4 /*yield*/, page.locator("#f_assistants2_1").selectOption("TestPerson2")];
                case 16:
                    _c.sent();
                    return [4 /*yield*/, checkPreSavedValues()];
                case 17:
                    _c.sent();
                    // Save the record and check they all refresh OK
                    return [4 /*yield*/, page.locator("#saveButton").click()];
                case 18:
                    // Save the record and check they all refresh OK
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/e_referencing_another_collection\/[0-9a-f]{24}\/edit/)];
                case 19:
                    _c.sent();
                    return [4 /*yield*/, checkPostSavedValues()];
                case 20:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=010_selects.spec.js.map