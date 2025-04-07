import { expect, test } from "@playwright/test";

test.describe("Conditionals", () => {
  const width = 1024;
  const height = 768;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width, height });
  });

  test("should not show hidden fields", async ({ page }) => {
    await page.goto(
      "http://localhost:9000/#/g_conditional_field/51c583d5b9991226db418f00/edit"
    );

    const datepickers = page.locator(".hasDatepicker");
    await expect(datepickers.first()).toBeHidden();

    await page.getByLabel("Accepted").check();
    await expect(datepickers.first()).toBeVisible();
    await expect(page.locator("#cg_f_loggedInBribeBook")).toBeVisible();

    await page.getByLabel("Bribe Amount").clear();
    await page.getByLabel("Bribe Amount").fill("2000");
    await expect(page.locator("#cg_f_loggedInBribeBook")).toBeHidden();
  });

  test("should not show hidden fields in sub schemas", async ({ page }) => {
    await page.goto(
      "http://localhost:9000/#/f_nested_schema/51c583d5b5c51226db418f17/edit"
    );

    const datepickers = page.locator(".hasDatepicker").all();
    const visibilityStates = await Promise.all(
      (await datepickers).map((dp) => dp.isVisible())
    );
    expect(visibilityStates).toEqual([true, false, true, true, true, false]);
  });
});
