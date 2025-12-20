import { test, expect, type Page } from '@playwright/test';

test.describe('Forms app demo', () => {

    test.beforeEach(async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: 1024, height: 768 });
    });

    test('should automatically redirect to index when location hash/fragment is empty', async ({ page }: { page: Page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/#\//);
        await expect(page.locator('h3')).toContainText('Probably the most opinionated framework in the world');
    });

});
