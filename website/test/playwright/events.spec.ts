import { test, expect, type Page } from '@playwright/test';

test.describe('Events', () => {

    test.beforeEach(async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: 1024, height: 768 });
    });

    test('should get an event from form input', async ({ page }: { page: Page }) => {
        // this tests the event handling on form input change
        await page.goto('/#/b_enhanced_schema/519a6075b320153869b155e0/edit');
        // Note: Playwright handles auto-waiting, browser.waitForAngular() usually unnecessary
        await expect(page.locator('#cg_f_accepted')).toHaveCSS('background-color', 'rgb(144, 238, 144)');
    });

});
