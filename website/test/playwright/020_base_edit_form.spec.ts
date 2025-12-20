import { test, expect, type Page } from '@playwright/test';

test.describe('Base edit form', () => {

    test.beforeEach(async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: 1024, height: 1468 });
    });

    test('should display a form without debug info', async ({ page }: { page: Page }) => {
        await page.goto('/#/b_enhanced_schema/new');
        await expect(page.locator('div#cg_f_surname')).toContainText(/Surname/);

        // check we haven't left the schema or record on display after debugging (assuming we used <pre>)
        await expect(page.locator('pre')).toHaveCount(0);
    });

    test('should display an error message if server validation fails', async ({ page }: { page: Page }) => {
        await page.goto('/#/b_enhanced_schema/new');
        const surnameField = page.locator('#f_surname');
        await surnameField.focus();
        await surnameField.pressSequentially('Smith', { delay: 10 });
        await surnameField.blur();

        const acceptedCheckbox = page.locator('#f_accepted');
        await acceptedCheckbox.focus();
        await acceptedCheckbox.setChecked(true);
        await acceptedCheckbox.blur();

        const freeTextField = page.locator('#f_freeText');
        await freeTextField.focus();
        await freeTextField.pressSequentially('this is a rude word', { delay: 10 });
        await freeTextField.blur();

        const saveBtn = page.locator('#saveButton');
        await saveBtn.click();

        await expect(page.locator('#err-title')).toContainText(/Error!/);
        await expect(page.locator('#err-msg')).toContainText(/Wash your mouth!/);

        await page.locator('#err-hide').click();
        await page.locator('#f_freeText').clear();
        await page.locator('#f_freeText').fill('this is polite');
        await saveBtn.click();
        await page.waitForURL(/\/b_enhanced_schema\/[0-9a-f]{24}\/edit/);
        await expect(page.url()).toMatch('/edit');
        await page.locator('#deleteButton').click();
        await expect(page.locator('.modal')).toBeVisible();
        await page.locator('.modal-footer button.dlg-yes').click();
        await page.waitForURL(/\/b_enhanced_schema/);
        await expect(page.url()).toMatch(/\/b_enhanced_schema/);
    });

    test.describe('deletion confirmation modal', () => {

        test.beforeEach(async ({ page }: { page: Page }) => {
            await page.goto('/#/a_unadorned_schema/666a6075b320153869b17599/edit');
        });

        test('should display deletion confirmation modal', async ({ page }: { page: Page }) => {
            await page.locator('#deleteButton').click();
            await page.waitForTimeout(400);
            const modal = page.locator('.modal');
            await expect(modal).toHaveCount(1);
            await expect(page.locator('.modal .modal-footer')).toContainText('No');
            await expect(page.locator('.modal .modal-footer')).toContainText('Yes');
            await expect(modal).toContainText('Are you sure you want to delete this record?');
            await expect(page.locator('.modal h3')).toContainText('Delete Item');
            await page.locator('.modal-footer button.dlg-no').click();
            await expect(page.url()).toMatch('/a_unadorned_schema/666a6075b320153869b17599/edit');
        });

    });

    test.describe('Allows user to navigate away', () => {

        test('does not put up dialog if no changes', async ({ page }: { page: Page }) => {
            await page.goto('/#/a_unadorned_schema/666a6075b320153869b17599/edit');
            await page.locator('#newButton').click();
            await expect(page.url()).toMatch('/a_unadorned_schema/new');
        });

    });

    test.describe('prompts user to save changes', () => {

        test.beforeEach(async ({ page }: { page: Page }) => {
            await page.goto('/#/b_enhanced_schema/519a6075b320153869b155e0/edit');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(500);
            await page.locator('#f_surname').pressSequentially('Smith');
            await page.locator('#f_surname').blur();
            await page.locator('#f_freeText').pressSequentially('The mouth is rude');
            await page.locator('#f_freeText').blur();
            await page.waitForTimeout(500);
            await page.locator('#newButton').click();
            await page.waitForTimeout(500);
        });

        test('supports cancelling navigation', async ({ page }: { page: Page }) => {
            const modal = page.locator('.modal');
            await expect(modal).toBeVisible();
            await expect(modal).toContainText('changes');
            await expect(page.locator('.modal .modal-footer')).toContainText('Cancel');
            await page.locator('.modal-footer button.dlg-cancel').click();
            await expect(modal).not.toBeVisible();
            await expect(page.url()).toMatch('/b_enhanced_schema/519a6075b320153869b155e0/edit');
        });

        test('supports losing changes', async ({ page }: { page: Page }) => {
            const modal = page.locator('.modal');
            await expect(modal).toBeVisible();
            await page.locator('.modal-footer button.dlg-no').click();
            await page.waitForURL(/\/b_enhanced_schema\/new/);
            await expect(page.url()).toMatch('/b_enhanced_schema/new');
        });

        test('supports saving changes', async ({ page }: { page: Page }) => {
            const modal = page.locator('.modal');
            await expect(modal).toBeVisible();
            await page.locator('.modal-footer button.dlg-yes').click();

            await expect(page.locator('.alert-error')).toContainText(/your mouth/);
            await page.locator('#err-hide').click();

            const freeTextField = page.locator('#f_freeText');
            await freeTextField.clear();
            await freeTextField.pressSequentially('This is a polite thing');
            await freeTextField.blur();
            await page.waitForTimeout(200);
            await page.locator('#newButton').click();
            // It might show the modal again if still dirty
            const modal2 = page.locator('.modal');
            if (await modal2.isVisible()) {
                await page.locator('.modal-footer button.dlg-yes').click();
            }
            await page.waitForURL(/\/b_enhanced_schema\/new/);
            await expect(page.url()).toMatch('/b_enhanced_schema/new');

            await page.goto('/#/b_enhanced_schema/519a6075b320153869b155e0/edit');
            await expect(page.locator('#f_freeText')).toHaveValue(/polite thing/);
        });
    });

    test.describe('form button changes', () => {

        test('enables cancel button after a change', async ({ page }: { page: Page }) => {
            await page.goto('/#/b_enhanced_schema/new');
            const surnameField = page.locator('#f_surname');
            await surnameField.clear();
            await surnameField.pressSequentially('Smith');

            const surnameInput = page.locator('#f_surname');
            await expect(surnameInput).toHaveValue(/Smith/);
            await page.locator('#cancelButton').click();
            await page.waitForTimeout(500);
            await expect(surnameInput).not.toHaveValue(/Smith/);
        });

        test('enables cancel button after deleting an array element', async ({ page }: { page: Page }) => {
            await page.goto('/#/d_array_example/51a6182aea4ea77715000005/edit');
            const list = page.locator('#cg_f_specialSubjects .fng-array');
            await expect(list).toHaveCount(1);
            await page.locator('#remove_f_specialSubjects_0').click();
            await expect(page.locator('#cg_f_specialSubjects .fng-array')).toHaveCount(0);
            await page.locator('#saveButton').click();
            await page.goto('/#/d_array_example/51a6182aea4ea77715000005/edit');
            await expect(page.locator('#cg_f_specialSubjects .fng-array')).toHaveCount(0);
        });

    });

    test.describe('tab sets', () => {

        test('shows multiple tabs when appropriate', async ({ page }: { page: Page }) => {
            await page.goto('/#/i_tabbed_form/new');
            const list = page.locator('.nav-tabs li a');
            await expect(list).toHaveCount(2);
        });

    });

});
