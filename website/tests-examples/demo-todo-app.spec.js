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
test_1.test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var page = _b.page;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, page.goto('https://demo.playwright.dev/todomvc')];
            case 1:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
var TODO_ITEMS = [
    'buy some cheese',
    'feed the cat',
    'book a doctors appointment'
];
test_1.test.describe('New Todo', function () {
    (0, test_1.test)('should allow me to add todo items', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var newTodo;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    newTodo = page.getByPlaceholder('What needs to be done?');
                    // Create 1st todo.
                    return [4 /*yield*/, newTodo.fill(TODO_ITEMS[0])];
                case 1:
                    // Create 1st todo.
                    _c.sent();
                    return [4 /*yield*/, newTodo.press('Enter')];
                case 2:
                    _c.sent();
                    // Make sure the list only has one todo item.
                    return [4 /*yield*/, (0, test_1.expect)(page.getByTestId('todo-title')).toHaveText([
                            TODO_ITEMS[0]
                        ])];
                case 3:
                    // Make sure the list only has one todo item.
                    _c.sent();
                    // Create 2nd todo.
                    return [4 /*yield*/, newTodo.fill(TODO_ITEMS[1])];
                case 4:
                    // Create 2nd todo.
                    _c.sent();
                    return [4 /*yield*/, newTodo.press('Enter')];
                case 5:
                    _c.sent();
                    // Make sure the list now has two todo items.
                    return [4 /*yield*/, (0, test_1.expect)(page.getByTestId('todo-title')).toHaveText([
                            TODO_ITEMS[0],
                            TODO_ITEMS[1]
                        ])];
                case 6:
                    // Make sure the list now has two todo items.
                    _c.sent();
                    return [4 /*yield*/, checkNumberOfTodosInLocalStorage(page, 2)];
                case 7:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should clear text input field when an item is added', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var newTodo;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    newTodo = page.getByPlaceholder('What needs to be done?');
                    // Create one todo item.
                    return [4 /*yield*/, newTodo.fill(TODO_ITEMS[0])];
                case 1:
                    // Create one todo item.
                    _c.sent();
                    return [4 /*yield*/, newTodo.press('Enter')];
                case 2:
                    _c.sent();
                    // Check that input is empty.
                    return [4 /*yield*/, (0, test_1.expect)(newTodo).toBeEmpty()];
                case 3:
                    // Check that input is empty.
                    _c.sent();
                    return [4 /*yield*/, checkNumberOfTodosInLocalStorage(page, 1)];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should append new items to the bottom of the list', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var todoCount;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Create 3 items.
                return [4 /*yield*/, createDefaultTodos(page)];
                case 1:
                    // Create 3 items.
                    _c.sent();
                    todoCount = page.getByTestId('todo-count');
                    // Check test using different methods.
                    return [4 /*yield*/, (0, test_1.expect)(page.getByText('3 items left')).toBeVisible()];
                case 2:
                    // Check test using different methods.
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoCount).toHaveText('3 items left')];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoCount).toContainText('3')];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoCount).toHaveText(/3/)];
                case 5:
                    _c.sent();
                    // Check all items in one call.
                    return [4 /*yield*/, (0, test_1.expect)(page.getByTestId('todo-title')).toHaveText(TODO_ITEMS)];
                case 6:
                    // Check all items in one call.
                    _c.sent();
                    return [4 /*yield*/, checkNumberOfTodosInLocalStorage(page, 3)];
                case 7:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_1.test.describe('Mark all as completed', function () {
    test_1.test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, createDefaultTodos(page)];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, checkNumberOfTodosInLocalStorage(page, 3)];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test_1.test.afterEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, checkNumberOfTodosInLocalStorage(page, 3)];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should allow me to mark all items as completed', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Complete all todos.
                return [4 /*yield*/, page.getByLabel('Mark all as complete').check()];
                case 1:
                    // Complete all todos.
                    _c.sent();
                    // Ensure all todos have 'completed' class.
                    return [4 /*yield*/, (0, test_1.expect)(page.getByTestId('todo-item')).toHaveClass(['completed', 'completed', 'completed'])];
                case 2:
                    // Ensure all todos have 'completed' class.
                    _c.sent();
                    return [4 /*yield*/, checkNumberOfCompletedTodosInLocalStorage(page, 3)];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should allow me to clear the complete state of all items', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var toggleAll;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    toggleAll = page.getByLabel('Mark all as complete');
                    // Check and then immediately uncheck.
                    return [4 /*yield*/, toggleAll.check()];
                case 1:
                    // Check and then immediately uncheck.
                    _c.sent();
                    return [4 /*yield*/, toggleAll.uncheck()];
                case 2:
                    _c.sent();
                    // Should be no completed classes.
                    return [4 /*yield*/, (0, test_1.expect)(page.getByTestId('todo-item')).toHaveClass(['', '', ''])];
                case 3:
                    // Should be no completed classes.
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('complete all checkbox should update state when items are completed / cleared', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var toggleAll, firstTodo;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    toggleAll = page.getByLabel('Mark all as complete');
                    return [4 /*yield*/, toggleAll.check()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(toggleAll).toBeChecked()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, checkNumberOfCompletedTodosInLocalStorage(page, 3)];
                case 3:
                    _c.sent();
                    firstTodo = page.getByTestId('todo-item').nth(0);
                    return [4 /*yield*/, firstTodo.getByRole('checkbox').uncheck()];
                case 4:
                    _c.sent();
                    // Reuse toggleAll locator and make sure its not checked.
                    return [4 /*yield*/, (0, test_1.expect)(toggleAll).not.toBeChecked()];
                case 5:
                    // Reuse toggleAll locator and make sure its not checked.
                    _c.sent();
                    return [4 /*yield*/, firstTodo.getByRole('checkbox').check()];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, checkNumberOfCompletedTodosInLocalStorage(page, 3)];
                case 7:
                    _c.sent();
                    // Assert the toggle all is checked again.
                    return [4 /*yield*/, (0, test_1.expect)(toggleAll).toBeChecked()];
                case 8:
                    // Assert the toggle all is checked again.
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_1.test.describe('Item', function () {
    (0, test_1.test)('should allow me to mark items as complete', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var newTodo, _i, _c, item, firstTodo, secondTodo;
        var page = _b.page;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    newTodo = page.getByPlaceholder('What needs to be done?');
                    _i = 0, _c = TODO_ITEMS.slice(0, 2);
                    _d.label = 1;
                case 1:
                    if (!(_i < _c.length)) return [3 /*break*/, 5];
                    item = _c[_i];
                    return [4 /*yield*/, newTodo.fill(item)];
                case 2:
                    _d.sent();
                    return [4 /*yield*/, newTodo.press('Enter')];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    firstTodo = page.getByTestId('todo-item').nth(0);
                    return [4 /*yield*/, firstTodo.getByRole('checkbox').check()];
                case 6:
                    _d.sent();
                    return [4 /*yield*/, (0, test_1.expect)(firstTodo).toHaveClass('completed')];
                case 7:
                    _d.sent();
                    secondTodo = page.getByTestId('todo-item').nth(1);
                    return [4 /*yield*/, (0, test_1.expect)(secondTodo).not.toHaveClass('completed')];
                case 8:
                    _d.sent();
                    return [4 /*yield*/, secondTodo.getByRole('checkbox').check()];
                case 9:
                    _d.sent();
                    // Assert completed class.
                    return [4 /*yield*/, (0, test_1.expect)(firstTodo).toHaveClass('completed')];
                case 10:
                    // Assert completed class.
                    _d.sent();
                    return [4 /*yield*/, (0, test_1.expect)(secondTodo).toHaveClass('completed')];
                case 11:
                    _d.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should allow me to un-mark items as complete', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var newTodo, _i, _c, item, firstTodo, secondTodo, firstTodoCheckbox;
        var page = _b.page;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    newTodo = page.getByPlaceholder('What needs to be done?');
                    _i = 0, _c = TODO_ITEMS.slice(0, 2);
                    _d.label = 1;
                case 1:
                    if (!(_i < _c.length)) return [3 /*break*/, 5];
                    item = _c[_i];
                    return [4 /*yield*/, newTodo.fill(item)];
                case 2:
                    _d.sent();
                    return [4 /*yield*/, newTodo.press('Enter')];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    firstTodo = page.getByTestId('todo-item').nth(0);
                    secondTodo = page.getByTestId('todo-item').nth(1);
                    firstTodoCheckbox = firstTodo.getByRole('checkbox');
                    return [4 /*yield*/, firstTodoCheckbox.check()];
                case 6:
                    _d.sent();
                    return [4 /*yield*/, (0, test_1.expect)(firstTodo).toHaveClass('completed')];
                case 7:
                    _d.sent();
                    return [4 /*yield*/, (0, test_1.expect)(secondTodo).not.toHaveClass('completed')];
                case 8:
                    _d.sent();
                    return [4 /*yield*/, checkNumberOfCompletedTodosInLocalStorage(page, 1)];
                case 9:
                    _d.sent();
                    return [4 /*yield*/, firstTodoCheckbox.uncheck()];
                case 10:
                    _d.sent();
                    return [4 /*yield*/, (0, test_1.expect)(firstTodo).not.toHaveClass('completed')];
                case 11:
                    _d.sent();
                    return [4 /*yield*/, (0, test_1.expect)(secondTodo).not.toHaveClass('completed')];
                case 12:
                    _d.sent();
                    return [4 /*yield*/, checkNumberOfCompletedTodosInLocalStorage(page, 0)];
                case 13:
                    _d.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should allow me to edit an item', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var todoItems, secondTodo;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, createDefaultTodos(page)];
                case 1:
                    _c.sent();
                    todoItems = page.getByTestId('todo-item');
                    secondTodo = todoItems.nth(1);
                    return [4 /*yield*/, secondTodo.dblclick()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(secondTodo.getByRole('textbox', { name: 'Edit' })).toHaveValue(TODO_ITEMS[1])];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, secondTodo.getByRole('textbox', { name: 'Edit' }).fill('buy some sausages')];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, secondTodo.getByRole('textbox', { name: 'Edit' }).press('Enter')];
                case 5:
                    _c.sent();
                    // Explicitly assert the new text value.
                    return [4 /*yield*/, (0, test_1.expect)(todoItems).toHaveText([
                            TODO_ITEMS[0],
                            'buy some sausages',
                            TODO_ITEMS[2]
                        ])];
                case 6:
                    // Explicitly assert the new text value.
                    _c.sent();
                    return [4 /*yield*/, checkTodosInLocalStorage(page, 'buy some sausages')];
                case 7:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_1.test.describe('Editing', function () {
    test_1.test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, createDefaultTodos(page)];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, checkNumberOfTodosInLocalStorage(page, 3)];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should hide other controls when editing', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var todoItem;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    todoItem = page.getByTestId('todo-item').nth(1);
                    return [4 /*yield*/, todoItem.dblclick()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItem.getByRole('checkbox')).not.toBeVisible()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItem.locator('label', {
                            hasText: TODO_ITEMS[1],
                        })).not.toBeVisible()];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, checkNumberOfTodosInLocalStorage(page, 3)];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should save edits on blur', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var todoItems;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    todoItems = page.getByTestId('todo-item');
                    return [4 /*yield*/, todoItems.nth(1).dblclick()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).fill('buy some sausages')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).dispatchEvent('blur')];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItems).toHaveText([
                            TODO_ITEMS[0],
                            'buy some sausages',
                            TODO_ITEMS[2],
                        ])];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, checkTodosInLocalStorage(page, 'buy some sausages')];
                case 5:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should trim entered text', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var todoItems;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    todoItems = page.getByTestId('todo-item');
                    return [4 /*yield*/, todoItems.nth(1).dblclick()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).fill('    buy some sausages    ')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).press('Enter')];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItems).toHaveText([
                            TODO_ITEMS[0],
                            'buy some sausages',
                            TODO_ITEMS[2],
                        ])];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, checkTodosInLocalStorage(page, 'buy some sausages')];
                case 5:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should remove the item if an empty text string was entered', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var todoItems;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    todoItems = page.getByTestId('todo-item');
                    return [4 /*yield*/, todoItems.nth(1).dblclick()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).fill('')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).press('Enter')];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItems).toHaveText([
                            TODO_ITEMS[0],
                            TODO_ITEMS[2],
                        ])];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should cancel edits on escape', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var todoItems;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    todoItems = page.getByTestId('todo-item');
                    return [4 /*yield*/, todoItems.nth(1).dblclick()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).fill('buy some sausages')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, todoItems.nth(1).getByRole('textbox', { name: 'Edit' }).press('Escape')];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItems).toHaveText(TODO_ITEMS)];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_1.test.describe('Counter', function () {
    (0, test_1.test)('should display the current number of todo items', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var newTodo, todoCount;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    newTodo = page.getByPlaceholder('What needs to be done?');
                    todoCount = page.getByTestId('todo-count');
                    return [4 /*yield*/, newTodo.fill(TODO_ITEMS[0])];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, newTodo.press('Enter')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoCount).toContainText('1')];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, newTodo.fill(TODO_ITEMS[1])];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, newTodo.press('Enter')];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoCount).toContainText('2')];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, checkNumberOfTodosInLocalStorage(page, 2)];
                case 7:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_1.test.describe('Clear completed button', function () {
    test_1.test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, createDefaultTodos(page)];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should display the correct text', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.locator('.todo-list li .toggle').first().check()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.getByRole('button', { name: 'Clear completed' })).toBeVisible()];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should remove completed items when clicked', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var todoItems;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    todoItems = page.getByTestId('todo-item');
                    return [4 /*yield*/, todoItems.nth(1).getByRole('checkbox').check()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, page.getByRole('button', { name: 'Clear completed' }).click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItems).toHaveCount(2)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]])];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should be hidden when there are no items that are completed', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.locator('.todo-list li .toggle').first().check()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, page.getByRole('button', { name: 'Clear completed' }).click()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.getByRole('button', { name: 'Clear completed' })).toBeHidden()];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_1.test.describe('Persistence', function () {
    (0, test_1.test)('should persist its data', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var newTodo, _i, _c, item, todoItems, firstTodoCheck;
        var page = _b.page;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    newTodo = page.getByPlaceholder('What needs to be done?');
                    _i = 0, _c = TODO_ITEMS.slice(0, 2);
                    _d.label = 1;
                case 1:
                    if (!(_i < _c.length)) return [3 /*break*/, 5];
                    item = _c[_i];
                    return [4 /*yield*/, newTodo.fill(item)];
                case 2:
                    _d.sent();
                    return [4 /*yield*/, newTodo.press('Enter')];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    todoItems = page.getByTestId('todo-item');
                    firstTodoCheck = todoItems.nth(0).getByRole('checkbox');
                    return [4 /*yield*/, firstTodoCheck.check()];
                case 6:
                    _d.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]])];
                case 7:
                    _d.sent();
                    return [4 /*yield*/, (0, test_1.expect)(firstTodoCheck).toBeChecked()];
                case 8:
                    _d.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItems).toHaveClass(['completed', ''])];
                case 9:
                    _d.sent();
                    // Ensure there is 1 completed item.
                    return [4 /*yield*/, checkNumberOfCompletedTodosInLocalStorage(page, 1)];
                case 10:
                    // Ensure there is 1 completed item.
                    _d.sent();
                    // Now reload.
                    return [4 /*yield*/, page.reload()];
                case 11:
                    // Now reload.
                    _d.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItems).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]])];
                case 12:
                    _d.sent();
                    return [4 /*yield*/, (0, test_1.expect)(firstTodoCheck).toBeChecked()];
                case 13:
                    _d.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItems).toHaveClass(['completed', ''])];
                case 14:
                    _d.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
test_1.test.describe('Routing', function () {
    test_1.test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, createDefaultTodos(page)];
                case 1:
                    _c.sent();
                    // make sure the app had a chance to save updated todos in storage
                    // before navigating to a new view, otherwise the items can get lost :(
                    // in some frameworks like Durandal
                    return [4 /*yield*/, checkTodosInLocalStorage(page, TODO_ITEMS[0])];
                case 2:
                    // make sure the app had a chance to save updated todos in storage
                    // before navigating to a new view, otherwise the items can get lost :(
                    // in some frameworks like Durandal
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should allow me to display active items', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var todoItem;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    todoItem = page.getByTestId('todo-item');
                    return [4 /*yield*/, page.getByTestId('todo-item').nth(1).getByRole('checkbox').check()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, checkNumberOfCompletedTodosInLocalStorage(page, 1)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.getByRole('link', { name: 'Active' }).click()];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItem).toHaveCount(2)];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItem).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]])];
                case 5:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should respect the back button', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var todoItem;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    todoItem = page.getByTestId('todo-item');
                    return [4 /*yield*/, page.getByTestId('todo-item').nth(1).getByRole('checkbox').check()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, checkNumberOfCompletedTodosInLocalStorage(page, 1)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, test_1.test.step('Showing all items', function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, page.getByRole('link', { name: 'All' }).click()];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, (0, test_1.expect)(todoItem).toHaveCount(3)];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, test_1.test.step('Showing active items', function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, page.getByRole('link', { name: 'Active' }).click()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, test_1.test.step('Showing completed items', function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, page.getByRole('link', { name: 'Completed' }).click()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItem).toHaveCount(1)];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, page.goBack()];
                case 7:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItem).toHaveCount(2)];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, page.goBack()];
                case 9:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(todoItem).toHaveCount(3)];
                case 10:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should allow me to display completed items', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.getByTestId('todo-item').nth(1).getByRole('checkbox').check()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, checkNumberOfCompletedTodosInLocalStorage(page, 1)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.getByRole('link', { name: 'Completed' }).click()];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.getByTestId('todo-item')).toHaveCount(1)];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should allow me to display all items', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, page.getByTestId('todo-item').nth(1).getByRole('checkbox').check()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, checkNumberOfCompletedTodosInLocalStorage(page, 1)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.getByRole('link', { name: 'Active' }).click()];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, page.getByRole('link', { name: 'Completed' }).click()];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, page.getByRole('link', { name: 'All' }).click()];
                case 5:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.getByTestId('todo-item')).toHaveCount(3)];
                case 6:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('should highlight the currently applied filter', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var activeLink, completedLink;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, test_1.expect)(page.getByRole('link', { name: 'All' })).toHaveClass('selected')];
                case 1:
                    _c.sent();
                    activeLink = page.getByRole('link', { name: 'Active' });
                    completedLink = page.getByRole('link', { name: 'Completed' });
                    return [4 /*yield*/, activeLink.click()];
                case 2:
                    _c.sent();
                    // Page change - active items.
                    return [4 /*yield*/, (0, test_1.expect)(activeLink).toHaveClass('selected')];
                case 3:
                    // Page change - active items.
                    _c.sent();
                    return [4 /*yield*/, completedLink.click()];
                case 4:
                    _c.sent();
                    // Page change - completed items.
                    return [4 /*yield*/, (0, test_1.expect)(completedLink).toHaveClass('selected')];
                case 5:
                    // Page change - completed items.
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
function createDefaultTodos(page) {
    return __awaiter(this, void 0, void 0, function () {
        var newTodo, _i, TODO_ITEMS_1, item;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newTodo = page.getByPlaceholder('What needs to be done?');
                    _i = 0, TODO_ITEMS_1 = TODO_ITEMS;
                    _a.label = 1;
                case 1:
                    if (!(_i < TODO_ITEMS_1.length)) return [3 /*break*/, 5];
                    item = TODO_ITEMS_1[_i];
                    return [4 /*yield*/, newTodo.fill(item)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, newTodo.press('Enter')];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function checkNumberOfTodosInLocalStorage(page, expected) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.waitForFunction(function (e) {
                        return JSON.parse(localStorage['react-todos']).length === e;
                    }, expected)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function checkNumberOfCompletedTodosInLocalStorage(page, expected) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.waitForFunction(function (e) {
                        return JSON.parse(localStorage['react-todos']).filter(function (todo) { return todo.completed; }).length === e;
                    }, expected)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function checkTodosInLocalStorage(page, title) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.waitForFunction(function (t) {
                        return JSON.parse(localStorage['react-todos']).map(function (todo) { return todo.title; }).includes(t);
                    }, title)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
//# sourceMappingURL=demo-todo-app.spec.js.map