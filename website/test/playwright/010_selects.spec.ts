import { test, expect, type Page, type Locator } from '@playwright/test';

test.describe('Select', () => {

    test.beforeEach(async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: 1024, height: 768 });
    });

    test('should handle enums', async ({ page }: { page: Page }) => {
        await page.goto('/#/b_enhanced_schema/519a6075b320153869b155e0/edit');
        await expect(page.locator('.ui-select-container > .select2-choice > span.select2-chosen').last()).toContainText(/Brown/);
    });

    test('should handle lookups using Ajax', async ({ page }: { page: Page }) => {
        await page.goto('/#/f_nested_schema/51c583d5b5c51226db418f16/edit');
        await expect(page.locator('.select2-container a > span.select2-chosen').nth(1)).toContainText(/IsAccepted/);
    });

    test('should do all the arrays in d as expected', async ({ page }: { page: Page }) => {

        async function addToArray(field: string, number: number = 2) {
            const addButton = page.locator('#add_f_' + field);
            for (let i = 0; i < number; i++) {
                await addButton.click();
                const input = page.locator('#f_' + field + '_' + i);
                await input.clear();
                await input.fill(field + ' ' + i);
            }
        }

        async function checkArray(field: string, number: number = 2) {
            for (let i = 0; i < number; i++) {
                await expect(page.locator('#f_' + field + '_' + i)).toHaveValue(field + ' ' + i);
            }
        }

        async function checkValues() {
            await checkArray('specialSubjects');
            await checkArray('hobbies');
            await checkArray('sports');
            await expect(page.locator('#f_someOptions_0')).toHaveValue('Second');
            await expect(page.locator('#f_someOptions_1')).toHaveValue('Third');
        }

        await page.goto('/#/d_array_example/new');
        await addToArray('specialSubjects');
        await addToArray('hobbies');
        await addToArray('sports');

        const addSelect = page.locator('#add_f_someOptions');
        await addSelect.click();
        await expect(page.locator('#f_someOptions_0')).toHaveClass(/ng-pristine/);

        await page.locator('#f_someOptions_0').selectOption('Second');
        await addSelect.click();
        await expect(page.locator('#f_someOptions_1')).toHaveClass(/ng-pristine/);
        await page.locator('#f_someOptions_1').selectOption('Third');

        await checkValues();

        // Save the record and check they all refresh OK
        page.once('dialog', dialog => dialog.accept());
        await page.locator('#saveButton').click();
        await page.waitForURL(/d_array_example\/[0-9a-f]{24}\/edit/);
        await expect(page.url()).toMatch(/d_array_example\/[0-9a-f]{24}\/edit/);
        await checkValues();
    });

    test('should do all the arrays in e as expected', async ({ page }: { page: Page }) => {

        async function checkNonChangingValues() {
            await expect(page.locator('#f_mentor')).toHaveValue('Anderson John');
            await expect(page.locator('#f_leadMentor')).toHaveValue('Anderson John');
            await expect(page.locator('#f_teacher a')).toContainText('IsAccepted John');
            await expect(page.locator('#f_assistants_0')).toHaveValue('TestPerson1');
            await expect(page.locator('#f_assistants_1')).toHaveValue('TestPerson2');
            await expect(page.locator('#f_assistants2_0')).toHaveValue('TestPerson1');
            await expect(page.locator('#f_assistants2_1')).toHaveValue('TestPerson2');
        }

        async function selectFngUiSelect(trigger: Locator, field: string, selectText: string, fullText: string, selectAgain?: boolean) {
            await trigger.click();
            await expect(page.locator('#' + field)).toHaveClass(/ng-valid/);

            if (selectAgain) {
                await page.locator('#' + field + ' a').click();
            }
            const input = page.locator('#' + field + ' .select2-search input');
            await input.pressSequentially(selectText, { delay: 100 });
            await expect(page.locator('.ui-select-choices-row').first()).toBeVisible();
            await page.keyboard.press('Enter');
            await expect(page.locator('#' + field + ' a')).toContainText(fullText);
        }

        await page.goto('/#/e_referencing_another_collection/new');

        await expect(page.locator('#f_teacher')).not.toHaveClass(/select2-allowclear/);
        await page.locator('#f_leadMentor').selectOption('Anderson John');
        await page.locator('#f_mentor').selectOption('Anderson John');
        await selectFngUiSelect(page.locator('#f_teacher a'), 'f_teacher', 'Is', 'IsAccepted John', false);

        const addSelectAssistants = page.locator('#add_f_assistants');
        await addSelectAssistants.click();
        await expect(page.locator('#f_assistants_0')).toHaveClass(/ng-pristine/);
        await page.locator('#f_assistants_0').selectOption('TestPerson1');
        await addSelectAssistants.click();
        await expect(page.locator('#f_assistants_1')).toHaveClass(/ng-pristine/);
        await page.locator('#f_assistants_1').selectOption('TestPerson2');

        const addSelectAssistants2 = page.locator('#add_f_assistants2');
        await addSelectAssistants2.click();
        await expect(page.locator('#f_assistants2_0')).toHaveClass(/ng-pristine/);
        await page.locator('#f_assistants2_0').selectOption('TestPerson1');
        await addSelectAssistants2.click();
        await expect(page.locator('#f_assistants2_1')).toHaveClass(/ng-pristine/);
        await page.locator('#f_assistants2_1').selectOption('TestPerson2');

        await checkNonChangingValues();

        await page.locator('#saveButton').click();
        await page.waitForURL(/e_referencing_another_collection\/[0-9a-f]{24}\/edit/);
        await expect(page.url()).toMatch(/e_referencing_another_collection\/[0-9a-f]{24}\/edit/);
        await checkNonChangingValues();
    });

});
