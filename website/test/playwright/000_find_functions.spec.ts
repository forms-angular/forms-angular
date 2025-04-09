import { expect, test } from "@playwright/test";

test.describe('Find functions', function () {

  var width = 1024;
  var height = 768;
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width, height }); // Makes it easier to watch in UI
  });

  test('should find only the allowed records', async ({page}) => {
    await page.goto('http://localhost:9000/#/b_enhanced_schema')
    const list = page.locator('.list-item');
    await expect(list).toHaveCount(2);
    const allList = page.locator('.list-body .row-fluid');
    await expect(allList).toHaveText(/IsAccepted/);
    await expect(allList).not.toHaveText(/NotAccepted/);
  });

  test('should support filters', async ({page}) =>  {
    await page.goto('http://localhost:9000/#/a_unadorned_schema?f=%7B%22eyeColour%22:%22Blue%22%7D');
    const list = page.locator('.list-item');
    await expect(list).toHaveCount(1);
    const allList = page.locator('a .list-item');
    await expect(allList).toHaveText(/TestPerson1/);
    await expect(allList).not.toHaveText(/TestPerson2/);
  });

});
