import { test, expect, type Page } from '@playwright/test';

test.describe('Find functions', () => {

  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
  });

  test('should find only the allowed records', async ({ page }: { page: Page }) => {
    await page.goto('/#/b_enhanced_schema');
    const list = page.locator('.list-item');
    await expect(list).toHaveCount(2);
    await expect(page.locator('.list-body')).toContainText(/IsAccepted/);
    await expect(page.locator('.list-body')).not.toContainText(/NotAccepted/);
  });

  test('should support filters', async ({ page }: { page: Page }) => {
    await page.goto('/#/a_unadorned_schema?f=%7B%22eyeColour%22:%22Blue%22%7D');
    const list = page.locator('.list-item');
    await expect(list).toHaveCount(1);
    await expect(page.locator('a .list-item')).toContainText(/TestPerson1/);
    await expect(page.locator('a .list-item')).not.toContainText(/TestPerson2/);
  });

});
