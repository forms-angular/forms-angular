import { expect, test } from "@playwright/test";

test.describe("Events", () => {
  const width = 1024;
  const height = 768;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width, height });
  });

  test("should get an event from form input", async ({ page }) => {
    // this tests the event handling on form input change
    await page.goto(
      "http://localhost:9000/#/b_enhanced_schema/519a6075b320153869b155e0/edit"
    );
    await expect(page.locator("#cg_f_accepted")).toHaveCSS(
      "background-color",
      "rgb(144, 238, 144)"
    );
  });
});
