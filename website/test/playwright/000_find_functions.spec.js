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
test_1.test.describe('Find functions', function () {
    var _this = this;
    var width = 1024;
    var height = 768;
    test_1.test.beforeEach(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
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
    (0, test_1.test)('should find only the allowed records', function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
        var list, allList;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto('http://localhost:9000/#/b_enhanced_schema')];
                case 1:
                    _c.sent();
                    list = page.locator('.list-item');
                    return [4 /*yield*/, (0, test_1.expect)(list).toHaveCount(2)];
                case 2:
                    _c.sent();
                    allList = page.locator('.list-body .row-fluid');
                    return [4 /*yield*/, (0, test_1.expect)(allList).toHaveText(/IsAccepted/)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(allList).not.toHaveText(/NotAccepted/)];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should support filters', function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
        var list, allList;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.goto('http://localhost:9000/#/a_unadorned_schema?f=%7B%22eyeColour%22:%22Blue%22%7D')];
                case 1:
                    _c.sent();
                    list = page.locator('.list-item');
                    return [4 /*yield*/, (0, test_1.expect)(list).toHaveCount(1)];
                case 2:
                    _c.sent();
                    allList = page.locator('a .list-item');
                    return [4 /*yield*/, (0, test_1.expect)(allList).toHaveText(/TestPerson1/)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(allList).not.toHaveText(/TestPerson2/)];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=000_find_functions.spec.js.map