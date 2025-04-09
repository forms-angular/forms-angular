import { expect, test } from "@playwright/test";

test.describe("Forms app demo", () => {
  const width = 1024;
  const height = 768;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width, height });
  });

  test("should automatically redirect to index when location hash/fragment is empty", async ({
    page,
  }) => {
    await page.goto("http://localhost:9000/");
    await expect(page).toHaveURL(/\/#\//);
    await expect(page.locator("h3")).toContainText(
      "Probably the most opinionated framework in the world"
    );
  });
});
