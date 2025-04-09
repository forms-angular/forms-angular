import { expect, test } from "@playwright/test";

test.describe("Base list", () => {
  const width = 1024;
  const height = 768;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width, height });
  });

  test("should list all the records", async ({ page }) => {
    await page.goto("http://localhost:9000/#/a_unadorned_schema");
    await expect(page.locator("a .list-item").first()).toContainText(
      /TestPerson/
    );
  });

  test("should support the listOrder option", async ({ page }) => {
    await page.goto("http://localhost:9000/#/g_conditional_field");
    const list = page.locator(".list-item");
    await expect(list).toHaveCount(17);
    await expect(
      page.locator(".list-item>.span6:first-child").nth(7)
    ).toContainText("Smith08");
  });

  test("should support the model name override", async ({ page }) => {
    await page.goto("http://localhost:9000/#/h_deep_nesting");
    await expect(page.locator("h1")).toContainText(/^Nesting /);
  });

  test("should support dropdown text override", async ({ page }) => {
    await page.goto("http://localhost:9000/#/b_enhanced_schema");
    await expect(page.locator("li.dropdown.mcdd")).toContainText(
      "Custom Dropdown"
    );
  });

  test("should revert to normal model descriptions", async ({ page }) => {
    await page.goto("http://localhost:9000/#/d_array_example");
    await expect(page.locator("h1")).toContainText("D Array Example");
  });

  test("should support the model name override with bespoke formschema", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:9000/#/b_enhanced_schema/justnameandpostcode"
    );
    await expect(page.locator("h1")).toContainText("Another override");
    await expect(page.locator("li.dropdown.mcdd")).toContainText(
      "Custom 2nd Level"
    );
  });

  test("should let user create a new record", async ({ page }) => {
    await page.goto("http://localhost:9000/#/b_enhanced_schema");
    await page.locator("#newBtn").click();
    await expect(page.locator("#cg_f_website label")).toContainText("Website");
  });
});
