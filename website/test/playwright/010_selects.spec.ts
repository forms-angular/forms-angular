import { expect, test } from "@playwright/test";

test.describe("Select", () => {
  const width = 1024;
  const height = 768;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width, height }); // Makes it easier to watch in UI
  });

  test("should handle enums", async ({ page }) => {
    await page.goto(
      "http://localhost:9000/#/b_enhanced_schema/519a6075b320153869b155e0/edit"
    );
    await expect(
      page
        .locator(".ui-select-container > .select2-choice > span.select2-chosen")
        .last()
    ).toHaveText(/Brown/);
  });

  test("should handle lookups using Ajax", async ({ page }) => {
    await page.goto(
      "http://localhost:9000/#/f_nested_schema/51c583d5b5c51226db418f16/edit"
    );
    await expect(page.locator("#f_exams_grader_0")).toContainText(/IsAccepted/);
  });

  test("should do all the arrays in d as expected", async ({ page }) => {
    async function addToArray(field: string, number = 2) {
      const addButton = page.locator(`#add_f_${field}`);
      for (let i = 0; i < number; i++) {
        await addButton.click();
        const input = page.locator(`#f_${field}_${i}`);
        await input.clear();
        await input.fill(`${field} ${i}`);
      }
    }

    async function checkArray(field: string, number = 2) {
      for (let i = 0; i < number; i++) {
        await expect(page.locator(`#f_${field}_${i}`)).toHaveValue(
          `${field} ${i}`
        );
      }
    }

    async function checkValues() {
      await checkArray("specialSubjects");
      await checkArray("hobbies");
      await checkArray("sports");
      await expect(page.locator("#f_someOptions_0")).toHaveValue("Second");
      await expect(page.locator("#f_someOptions_1")).toHaveValue("Third");
    }

    await page.goto("http://localhost:9000/#/d_array_example/new");
    await addToArray("specialSubjects");
    await addToArray("hobbies");
    await addToArray("sports");

    await page.locator("#add_f_someOptions").click();
    await expect(page.locator("#f_someOptions_0")).toHaveClass(/ng-pristine/);
    await page.getByLabel("Some Options").selectOption("Second");
    await page.locator("#add_f_someOptions").click();
    await expect(page.locator("#f_someOptions_1")).toHaveClass(/ng-pristine/);
    await page.locator("#f_someOptions_1").selectOption("Third");

    await checkValues();

    // Save the record and check they all refresh OK
    await page.locator("#saveButton").click();
    // Handle alert
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });
    await expect(page).toHaveURL(/d_array_example\/[0-9a-f]{24}\/edit/);
    await checkValues();
  });

  test("should do all the arrays in e as expected", async ({ page }) => {
    async function checkNonChangingValues() {
      await expect(page.locator("#f_mentor")).toHaveValue("Anderson John");
      await expect(page.locator("#f_leadMentor")).toHaveValue("Anderson John");
      await expect(page.locator("#f_teacher a")).toContainText(
        "IsAccepted John"
      );
      await expect(page.locator("#f_assistants_0")).toHaveValue("TestPerson1");
      await expect(page.locator("#f_assistants_1")).toHaveValue("TestPerson2");
      await expect(page.locator("#f_assistants2_0")).toHaveValue("TestPerson1");
      await expect(page.locator("#f_assistants2_1")).toHaveValue("TestPerson2");
    }

    async function checkPreSavedValues() {
      await checkNonChangingValues();
    }

    async function checkPostSavedValues() {
      await checkNonChangingValues();
    }

    await page.goto(
      "http://localhost:9000/#/e_referencing_another_collection/new"
    );

    await expect(page.locator("#f_teacher")).not.toHaveClass(
      /select2-allowclear/
    );
    await page.getByLabel("Lead Mentor").selectOption("Anderson John");
    await page
      .getByLabel("Mentor", { exact: true })
      .selectOption("Anderson John");

    await page.locator("#f_teacher").getByLabel("Select box select").click();
    await expect(page.locator("#f_teacher")).toHaveClass(/ng-valid/);
    await page.getByRole("combobox", { name: "Select box" }).fill("Is");
    await page.getByText("IsAccepted John true").click();

    await page.locator("#add_f_assistants").click();
    await page.getByLabel("Assistants").selectOption("TestPerson1");
    await page.locator("#add_f_assistants").click();
    await page.locator("#f_assistants_1").selectOption("TestPerson2");

    await page.locator("#add_f_assistants2").click();
    await page.getByLabel("Assistants2").selectOption("TestPerson1");
    await page.locator("#add_f_assistants2").click();
    await page.locator("#f_assistants2_1").selectOption("TestPerson2");

    await checkPreSavedValues();

    // Save the record and check they all refresh OK
    await page.locator("#saveButton").click();
    await expect(page).toHaveURL(
      /e_referencing_another_collection\/[0-9a-f]{24}\/edit/
    );
    await checkPostSavedValues();
  });
});
