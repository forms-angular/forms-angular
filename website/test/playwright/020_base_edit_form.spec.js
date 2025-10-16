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
var support_funcs_1 = require("./support-funcs");
test_1.test.describe("Base edit form", function () {
    var width = 1024;
    var height = 1468;
    test_1.test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.setViewportSize({ width: width, height: height })];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)("should display a form without debug info", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto("http://localhost:9000/#/b_enhanced_schema/new")];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator("div#cg_f_surname")).toContainText(/Surname/)];
                case 2:
                    _c.sent();
                    // check we haven't left the schema or record on display after debugging (assuming we used <pre>)
                    return [4 /*yield*/, (0, test_1.expect)(page.locator("pre")).toHaveCount(0)];
                case 3:
                    // check we haven't left the schema or record on display after debugging (assuming we used <pre>)
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)("should display an error message if server validation fails", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto("http://localhost:9000/#/b_enhanced_schema/new")];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, page.getByLabel("Surname").fill("Smith")];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.getByLabel("Accepted").check()];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, page.getByLabel("Free Text").fill("this is a rude word")];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, page.locator("#saveButton").click()];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator("#err-title")).toContainText(/Error!/)];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator("#err-msg")).toContainText(/Wash your mouth!/)];
                case 7:
                    _c.sent();
                    return [4 /*yield*/, page.locator("#err-hide").click()];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, page.getByLabel("Free Text").fill("this is polite")];
                case 9:
                    _c.sent();
                    return [4 /*yield*/, page.locator("#saveButton").click()];
                case 10:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/edit/)];
                case 11:
                    _c.sent();
                    return [4 /*yield*/, page.locator("#deleteButton").click()];
                case 12:
                    _c.sent();
                    return [4 /*yield*/, page.locator(".modal-footer button.dlg-yes").click()];
                case 13:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/#\/$/)];
                case 14:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test_1.test.describe("should display deletion confirmation modal", function () {
        test_1.test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var page = _b.page;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, page.goto("http://localhost:9000/#/a_unadorned_schema/666a6075b320153869b17599/edit")];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, test_1.test)("should display deletion confirmation modal", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var modal;
            var page = _b.page;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, page.locator("#deleteButton").click()];
                    case 1:
                        _c.sent();
                        modal = page.locator(".modal");
                        return [4 /*yield*/, (0, test_1.expect)(modal).toHaveCount(1)];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, (0, test_1.expect)(page.locator(".modal .modal-footer")).toContainText("No")];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, (0, test_1.expect)(page.locator(".modal .modal-footer")).toContainText("Yes")];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, (0, test_1.expect)(modal).toContainText("Are you sure you want to delete this record?")];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, (0, test_1.expect)(page.locator(".modal h3")).toContainText("Delete Item")];
                    case 6:
                        _c.sent();
                        return [4 /*yield*/, page.locator(".modal-footer button.dlg-no").click()];
                    case 7:
                        _c.sent();
                        return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/a_unadorned_schema\/666a6075b320153869b17599\/edit/)];
                    case 8:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    test_1.test.describe("Allows user to navigate away", function () {
        (0, test_1.test)("does not put up dialog if no changes", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var page = _b.page;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, page.goto("http://localhost:9000/#/a_unadorned_schema/666a6075b320153869b17599/edit")];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, page.locator("#newButton").click()];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/a_unadorned_schema\/new/)];
                    case 3:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    test_1.test.describe("prompts user to save changes", function () {
        test_1.test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var page = _b.page;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, support_funcs_1.reseed)(page)];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, page.goto("http://localhost:9000/#/b_enhanced_schema/519a6075b320153869b155e0/edit")];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, page.getByLabel("Surname").clear()];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, page.getByLabel("Surname").fill("Smith")];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, page.getByLabel("Free Text").fill("This is a rude thing")];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, page.locator("#newButton").click()];
                    case 6:
                        _c.sent();
                        return [4 /*yield*/, page.waitForTimeout(250)];
                    case 7:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, test_1.test)("supports cancelling navigation", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var modal;
            var page = _b.page;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        modal = page.locator(".modal");
                        return [4 /*yield*/, (0, test_1.expect)(modal).toHaveCount(1)];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, (0, test_1.expect)(modal).toContainText(/changes/)];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, (0, test_1.expect)(page.locator(".modal .modal-footer")).toContainText("Cancel")];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, page.locator(".modal-footer button.dlg-cancel").click()];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/b_enhanced_schema\/519a6075b320153869b155e0\/edit/)];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, (0, test_1.expect)(modal).toHaveCount(0)];
                    case 6:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        (0, test_1.test)("supports losing changes", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var modal;
            var page = _b.page;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        modal = page.locator(".modal");
                        return [4 /*yield*/, (0, test_1.expect)(modal).toHaveCount(1)];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, (0, test_1.expect)(modal).toContainText(/changes/)];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, (0, test_1.expect)(page.locator(".modal .modal-footer")).toContainText("Cancel")];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, page.locator(".modal-footer button.dlg-no").click()];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/b_enhanced_schema\/new/)];
                    case 5:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=020_base_edit_form.spec.js.map