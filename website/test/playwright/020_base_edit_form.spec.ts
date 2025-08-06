import { expect, test } from "@playwright/test";
import { reseed } from './support-funcs';

test.describe("Base edit form", () => {
  const width = 1024;
  const height = 1468;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width, height });
  });

  test("should display a form without debug info", async ({ page }) => {
    await page.goto("http://localhost:9000/#/b_enhanced_schema/new");
    await expect(page.locator("div#cg_f_surname")).toContainText(/Surname/);

    // check we haven't left the schema or record on display after debugging (assuming we used <pre>)
    await expect(page.locator("pre")).toHaveCount(0);
  });

  test("should display an error message if server validation fails", async ({
    page,
  }) => {
    await page.goto("http://localhost:9000/#/b_enhanced_schema/new");
    await page.getByLabel("Surname").fill("Smith");
    await page.getByLabel("Accepted").check();
    await page.getByLabel("Free Text").fill("this is a rude word");
    await page.locator("#saveButton").click();

    await expect(page.locator("#err-title")).toContainText(/Error!/);
    await expect(page.locator("#err-msg")).toContainText(/Wash your mouth!/);
    await page.locator("#err-hide").click();

    await page.getByLabel("Free Text").fill("this is polite");
    await page.locator("#saveButton").click();
    await expect(page).toHaveURL(/\/edit/);

    await page.locator("#deleteButton").click();
    await page.locator(".modal-footer button.dlg-yes").click();
    await expect(page).toHaveURL(/\/#\/$/);
  });

  test.describe("should display deletion confirmation modal", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        "http://localhost:9000/#/a_unadorned_schema/666a6075b320153869b17599/edit"
      );
    });

    test("should display deletion confirmation modal", async ({ page }) => {
      await page.locator("#deleteButton").click();

      const modal = page.locator(".modal");
      await expect(modal).toHaveCount(1);
      await expect(page.locator(".modal .modal-footer")).toContainText("No");
      await expect(page.locator(".modal .modal-footer")).toContainText("Yes");
      await expect(modal).toContainText(
        "Are you sure you want to delete this record?"
      );
      await expect(page.locator(".modal h3")).toContainText("Delete Item");

      await page.locator(".modal-footer button.dlg-no").click();
      await expect(page).toHaveURL(
        /\/a_unadorned_schema\/666a6075b320153869b17599\/edit/
      );
    });
  });

  test.describe("Allows user to navigate away", () => {
    test("does not put up dialog if no changes", async ({ page }) => {
      await page.goto(
        "http://localhost:9000/#/a_unadorned_schema/666a6075b320153869b17599/edit"
      );
      await page.locator("#newButton").click();
      await expect(page).toHaveURL(/\/a_unadorned_schema\/new/);
    });
  });

  test.describe("prompts user to save changes", () => {

    test.beforeEach(async ({ page }) => {
      await reseed(page);
      await page.goto(
        "http://localhost:9000/#/b_enhanced_schema/519a6075b320153869b155e0/edit"
      );
      await page.getByLabel("Surname").clear();
      await page.getByLabel("Surname").fill("Smith");
      await page.getByLabel("Free Text").fill("This is a rude thing");
      await page.locator("#newButton").click();
      await page.waitForTimeout(250);
    });

    test("supports cancelling navigation", async ({ page }) => {
      const modal = page.locator(".modal");
      await expect(modal).toHaveCount(1);
      await expect(modal).toContainText(/changes/);
      await expect(page.locator(".modal .modal-footer")).toContainText(
        "Cancel"
      );

      await page.locator(".modal-footer button.dlg-cancel").click();
      await expect(page).toHaveURL(
        /\/b_enhanced_schema\/519a6075b320153869b155e0\/edit/
      );
      await expect(modal).toHaveCount(0);
    });

    test("supports losing changes", async ({ page }) => {
      const modal = page.locator(".modal");
      await expect(modal).toHaveCount(1);
      await expect(modal).toContainText(/changes/);
      await expect(page.locator(".modal .modal-footer")).toContainText(
        "Cancel"
      );

      await page.locator(".modal-footer button.dlg-no").click();
      await expect(page).toHaveURL(/\/b_enhanced_schema\/new/);
    });
  });
});
