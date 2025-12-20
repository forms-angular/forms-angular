import { test, expect, type Page } from '@playwright/test';

test.describe('Reports', () => {

    test.beforeEach(async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: 1024, height: 768 });
    });

    test('should do simple pipeline reports', async ({ page }: { page: Page }) => {
        await page.goto('/#/analyse/g_conditional_field?r=%5B%7B%22$group%22:%7B%22_id%22:%22$sex%22,%22count%22:%7B%22$sum%22:1%7D%7D%7D,%7B%22$sort%22:%7B%22_id%22:1%7D%7D%5D');
        await expect(page.locator('.ui-grid-cell-contents')).toHaveText([/Id/, /Count/, 'F', '11', 'M', '6']);
    });

    test('should do reports with options from the command line', async ({ page }: { page: Page }) => {
        await page.goto('/#/analyse/g_conditional_field?r={"pipeline":[{"$group":{"_id":"$sex","count":{"$sum":1}}},{"$sort":{"_id":1}}],"title":"Breakdown By Sex"' +
            ',"columnDefs":[{"field":"_id","displayName":"Sex"},{"field":"count","displayName":"No of Applicants"}]}');
        await expect(page.locator('.ui-grid-cell-contents')).toHaveText([/Sex/, /No of Applicants/, 'F', '11', 'M', '6']);
    });

    test('should generate a default report', async ({ page }: { page: Page }) => {
        await page.goto('/#/analyse/b_enhanced_schema');
        const cells = page.locator('.ui-grid-cell-contents');
        await expect(cells.filter({ hasText: 'Date Of Birth' }).first()).toBeVisible();
        const cell1 = page.locator('.ui-grid-cell-contents', { hasText: '519a6075b320153869b155e0' });
        await expect(cell1.first()).toBeVisible();
        const cell2 = page.locator('.ui-grid-cell-contents', { hasText: '519a6075b440153869b155e0' });
        await expect(cell2.first()).toBeVisible();
        await cell2.first().click();
        await expect(page.url()).toMatch(/\/b_enhanced_schema\/(519a6075b440153869b155e0|519a6075b320153869b155e0)\/edit/);
    });

    test('should run a standard report', async ({ page }: { page: Page }) => {
        await page.goto('/#/analyse/g_conditional_field/breakdownbysex');
        await expect(page.locator('h1')).toContainText('Numbers of Applicants By Sex');
        await expect(page.locator('.ui-grid-cell-contents')).toHaveText([/Sex/, /No of Applicants/, 'Female', '11', 'Male', '6']);
    });

});
