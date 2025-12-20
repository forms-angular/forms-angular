import { test, expect, type Page } from '@playwright/test';

test.describe('Conditionals', () => {

    test.beforeEach(async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: 1024, height: 768 });
    });

    test('should not show hidden fields', async ({ page }: { page: Page }) => {
        await page.goto('/#/g_conditional_field/51c583d5b9991226db418f00/edit');

        const items = page.locator('.hasDatepicker');
        // Protractor code was checking isDisplayed() for all items
        // In Playwright, we can check visibility of specific elements
        await expect(items).not.toBeVisible();

        await page.locator('#f_accepted').click();
        await expect(page.locator('.hasDatepicker')).toBeVisible();
        await expect(page.locator('#cg_f_loggedInBribeBook')).toBeVisible();

        const bribeField = page.locator('#f_bribeAmount');
        await bribeField.clear();
        await bribeField.fill('2000');
        await expect(page.locator('#cg_f_loggedInBribeBook')).not.toBeVisible();
    });

    test('should not show hidden fields in sub schemas', async ({ page }: { page: Page }) => {
        await page.goto('/#/f_nested_schema/51c583d5b5c51226db418f17/edit');
        // Note: browser.waitForAngular() is often handled by Playwright's auto-waiting, 
        // but if needed, we'd wait for a specific state or network idle.

        const items = page.locator('.hasDatepicker');
        // Original check: expect(items).toEqual([true, false, true, true, true, false]);
        // We can check each individually
        await expect(items.nth(0)).toBeVisible();
        await expect(items.nth(1)).not.toBeVisible();
        await expect(items.nth(2)).toBeVisible();
        await expect(items.nth(3)).toBeVisible();
        await expect(items.nth(4)).toBeVisible();
        await expect(items.nth(5)).not.toBeVisible();
    });

});
