import { test, expect, type Page } from '@playwright/test';

// Regression coverage for arrays nested within arrays (a sub-schema array inside another
// sub-schema array, e.g. h_deep_nesting's studies.courses[].teachers[]). This previously only
// logged "Attempts at supporting deep nesting have been removed" and rendered nothing.
test.describe('Deep nesting (array within an array)', () => {

    test.beforeEach(async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: 1024, height: 1468 });
        await page.goto('/#/h_deep_nesting/54c98b797c627d258d04d55d/edit');
    });

    test('renders the nested array and supports add / edit / remove of its rows', async ({ page }: { page: Page }) => {
        const teachersContainer = page.locator('#cg_f_studies_courses_teachers_0');
        await expect(teachersContainer).toContainText('Teachers');
        await expect(teachersContainer.locator('li')).toHaveCount(0);

        await teachersContainer.locator('#add_f_studies_courses_teachers_btn').click();
        await expect(teachersContainer.locator('li')).toHaveCount(1);

        const roomField = page.locator('#f_teachers_room_0');
        await roomField.fill('42');
        await roomField.blur();

        await page.locator('#saveButton').click();
        await page.waitForURL(/\/h_deep_nesting\/54c98b797c627d258d04d55d\/edit/);
        await expect(page.locator('#err-title')).not.toBeVisible();

        // reload from the server to prove the nested value round-tripped, not just local state
        await page.goto('/#/h_deep_nesting/54c98b797c627d258d04d55d/edit');
        await expect(page.locator('#f_teachers_room_0')).toHaveValue('42');

        await page.locator('button[name="remove_f_studies_courses_teachers_btn"]').click();
        await expect(page.locator('#cg_f_studies_courses_teachers_0 li')).toHaveCount(0);

        await page.locator('#saveButton').click();
        await page.waitForURL(/\/h_deep_nesting\/54c98b797c627d258d04d55d\/edit/);
        await page.goto('/#/h_deep_nesting/54c98b797c627d258d04d55d/edit');
        await expect(page.locator('#cg_f_studies_courses_teachers_0 li')).toHaveCount(0);
    });

});
