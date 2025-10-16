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
// Custom matcher to check if an array includes a value
var toIncludeText = function (locator, expected) { return __awaiter(void 0, void 0, void 0, function () {
    var texts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, locator.allTextContents()];
            case 1:
                texts = _a.sent();
                return [2 /*return*/, texts.some(function (text) { return text.includes(expected); })];
        }
    });
}); };
test_1.test.describe("Reports", function () {
    var width = 1024;
    var height = 768;
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
    (0, test_1.test)("should do simple pipeline reports", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto("http://localhost:9000/#/analyse/g_conditional_field?r=%5B%7B%22$group%22:%7B%22_id%22:%22$sex%22,%22count%22:%7B%22$sum%22:1%7D%7D%7D,%7B%22$sort%22:%7B%22_id%22:1%7D%7D%5D")];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator(".ui-grid-cell-contents").nth(0)).toHaveText(/Id/)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator(".ui-grid-cell-contents").nth(1)).toHaveText(/Count/)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator(".ui-grid-cell-contents").nth(2)).toHaveText("F")];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator(".ui-grid-cell-contents").nth(3)).toHaveText("11")];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator(".ui-grid-cell-contents").nth(4)).toHaveText("M")];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator(".ui-grid-cell-contents").nth(5)).toHaveText("6")];
                case 7:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)("should do reports with options from the command line", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto("http://localhost:9000/#/analyse/g_conditional_field?r=" +
                        encodeURIComponent(JSON.stringify({
                            pipeline: [
                                { $group: { _id: "$sex", count: { $sum: 1 } } },
                                { $sort: { _id: 1 } },
                            ],
                            title: "Breakdown By Sex",
                            columnDefs: [
                                { field: "_id", displayName: "Sex" },
                                { field: "count", displayName: "No of Applicants" },
                            ],
                        })))];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator(".ui-grid-cell-contents").nth(0)).toHaveText(/Sex/)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator(".ui-grid-cell-contents").nth(1)).toHaveText(/No of Applicants/)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator(".ui-grid-cell-contents").nth(2)).toHaveText("F")];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator(".ui-grid-cell-contents").nth(3)).toHaveText("11")];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator(".ui-grid-cell-contents").nth(4)).toHaveText("M")];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator(".ui-grid-cell-contents").nth(5)).toHaveText("6")];
                case 7:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)("should generate a default report", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var gridCells;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto("http://localhost:9000/#/analyse/b_enhanced_schema")];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator(".ui-grid-cell-contents").nth(5)).toHaveText(/Date Of Birth/)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator(".ui-grid-cell-contents").nth(10)).toHaveText(/(519a6075b440153869b155e0|519a6075b320153869b155e0)/)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, page
                            .locator(".ui-grid-cell-contents")];
                case 4:
                    gridCells = _c.sent();
                    return [4 /*yield*/, gridCells.last().click()];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(/\/b_enhanced_schema\/(519a6075b440153869b155e0|519a6075b320153869b155e0)\/edit/)];
                case 6:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)("should run a standard report", function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var cells;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto("http://localhost:9000/#/analyse/g_conditional_field/breakdownbysex")];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.locator("h1")).toContainText("Numbers of Applicants By Sex")];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page
                            .locator(".ui-grid-cell-contents")
                            .allTextContents()];
                case 3:
                    cells = _c.sent();
                    (0, test_1.expect)(cells).toEqual([
                        "Sex  1",
                        "No of Applicants  1",
                        "Female",
                        "11",
                        "Male",
                        "6",
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=reports.spec.js.map