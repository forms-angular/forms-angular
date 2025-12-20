import { test, expect, type Page } from '@playwright/test';

test.describe('Navigation', () => {

    test.beforeEach(async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: 1024, height: 768 });
    });

    const baseMenuCount = 7;

    test('should cope with a list with menu options', async ({ page }: { page: Page }) => {
        await page.goto('/#/b_enhanced_schema');
        const list = page.locator('.dropdown-option');
        await expect(list).toHaveCount(1 + baseMenuCount);
    });

    test('should cope with a list without menu options', async ({ page }: { page: Page }) => {
        await page.goto('/#/d_array_example');
        const list = page.locator('.dropdown-option');
        await expect(list).toHaveCount(baseMenuCount);
    });

    test('should cope with an edit screen with menu options', async ({ page }: { page: Page }) => {
        await page.goto('/#/b_enhanced_schema/519a6075b320153869b155e0/edit');
        const list = page.locator('.dropdown-option');
        await expect(list).toHaveCount(2 + baseMenuCount);
    });

    test('should cope with an edit screen without menu options', async ({ page }: { page: Page }) => {
        await page.goto('/#/a_unadorned_schema/519a6075b320153869b17599/edit');
        const list = page.locator('.dropdown-option');
        await expect(list).toHaveCount(baseMenuCount);
    });

});
