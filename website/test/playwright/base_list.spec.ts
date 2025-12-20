import { test, expect, type Page } from '@playwright/test';

test.describe('Base list', () => {

    test.beforeEach(async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: 1024, height: 768 });
    });

    test('should list all the records', async ({ page }: { page: Page }) => {
        await page.goto('/#/a_unadorned_schema');
        await expect(page.locator('a .list-item').first()).toContainText(/TestPerson/);
    });

    test('should support the listOrder option', async ({ page }: { page: Page }) => {
        await page.goto('/#/g_conditional_field');
        await page.waitForLoadState('networkidle');
        const list = page.locator('.list-item');
        await expect(list.first()).toBeVisible();
        await expect(await list.count()).toBeGreaterThan(8);
        await expect(page.locator('.list-item>.span6:first-child').nth(7)).toContainText('Smith08');
    });

    test('should support the model name override', async ({ page }: { page: Page }) => {
        await page.goto('/#/h_deep_nesting');
        await expect(page.locator('h1')).toContainText(/^Nesting /);
    });

    test('should support dropdown text override', async ({ page }: { page: Page }) => {
        await page.goto('/#/b_enhanced_schema');
        await expect(page.locator('li.dropdown.mcdd')).toContainText('Custom Dropdown');
    });

    test('should revert to normal model descriptions', async ({ page }: { page: Page }) => {
        await page.goto('/#/d_array_example');
        await expect(page.locator('h1')).toContainText('D Array Example');
    });

    test('should support the model name override with bespoke formschema', async ({ page }: { page: Page }) => {
        await page.goto('/#/b_enhanced_schema/justnameandpostcode');
        await expect(page.locator('h1')).toContainText('Another override');
        await expect(page.locator('li.dropdown.mcdd')).toContainText('Custom 2nd Level');
    });

    test('should let user create a new record', async ({ page }: { page: Page }) => {
        await page.goto('/#/b_enhanced_schema');
        await page.locator('#newBtn').click();
        await expect(page.locator('#cg_f_website label')).toContainText('Website');
    });

});
