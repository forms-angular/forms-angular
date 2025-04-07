import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  const width = 1024;
  const height = 768;
  const baseMenuCount = 7;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width, height });
  });

  test("should cope with a list with menu options", async ({ page }) => {
    await page.goto("http://localhost:9000/#/b_enhanced_schema");
    await expect(page.locator(".dropdown-option")).toHaveCount(1 + baseMenuCount);
  });

  test("should cope with a list without menu options", async ({ page }) => {
    await page.goto("http://localhost:9000/#/d_array_example");
    await expect(page.locator(".dropdown-option")).toHaveCount(0 + baseMenuCount);
  });

  test("should cope with an edit screen with menu options", async ({ page }) => {
    await page.goto(
      "http://localhost:9000/#/b_enhanced_schema/519a6075b320153869b155e0/edit"
    );
    await expect(page.locator(".dropdown-option")).toHaveCount(2 + baseMenuCount);
  });

  test("should cope with an edit screen without menu options", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:9000/#/a_unadorned_schema/519a6075b320153869b17599/edit"
    );
    await expect(page.locator(".dropdown-option")).toHaveCount(0 + baseMenuCount);
  });
});
