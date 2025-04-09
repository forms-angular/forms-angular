import { expect, test } from "@playwright/test";

// Custom matcher to check if an array includes a value
const toIncludeText = async (locator: any, expected: string) => {
  const texts = await locator.allTextContents();
  return texts.some((text: string) => text.includes(expected));
};

test.describe("Reports", () => {
  const width = 1024;
  const height = 768;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width, height });
  });

  test("should do simple pipeline reports", async ({ page }) => {
    await page.goto(
      "http://localhost:9000/#/analyse/g_conditional_field?r=%5B%7B%22$group%22:%7B%22_id%22:%22$sex%22,%22count%22:%7B%22$sum%22:1%7D%7D%7D,%7B%22$sort%22:%7B%22_id%22:1%7D%7D%5D"
    );

    await expect(page.locator(".ui-grid-cell-contents").nth(0)).toHaveText(/Id/);
    await expect(page.locator(".ui-grid-cell-contents").nth(1)).toHaveText(/Count/);
    await expect(page.locator(".ui-grid-cell-contents").nth(2)).toHaveText("F");
    await expect(page.locator(".ui-grid-cell-contents").nth(3)).toHaveText("11");
    await expect(page.locator(".ui-grid-cell-contents").nth(4)).toHaveText("M");
    await expect(page.locator(".ui-grid-cell-contents").nth(5)).toHaveText("6");
  });

  test("should do reports with options from the command line", async ({
    page,
  }) => {
    await page.goto(
      "http://localhost:9000/#/analyse/g_conditional_field?r=" +
        encodeURIComponent(
          JSON.stringify({
            pipeline: [
              { $group: { _id: "$sex", count: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ],
            title: "Breakdown By Sex",
            columnDefs: [
              { field: "_id", displayName: "Sex" },
              { field: "count", displayName: "No of Applicants" },
            ],
          })
        )
    );

    await expect(page.locator(".ui-grid-cell-contents").nth(0)).toHaveText(/Sex/);
    await expect(page.locator(".ui-grid-cell-contents").nth(1)).toHaveText(/No of Applicants/);
    await expect(page.locator(".ui-grid-cell-contents").nth(2)).toHaveText("F");
    await expect(page.locator(".ui-grid-cell-contents").nth(3)).toHaveText("11");
    await expect(page.locator(".ui-grid-cell-contents").nth(4)).toHaveText("M");
    await expect(page.locator(".ui-grid-cell-contents").nth(5)).toHaveText("6");
  });

  test("should generate a default report", async ({ page }) => {
    await page.goto("http://localhost:9000/#/analyse/b_enhanced_schema");


    await expect(page.locator(".ui-grid-cell-contents").nth(5)).toHaveText(/Date Of Birth/);
    await expect(page.locator(".ui-grid-cell-contents").nth(10)).toHaveText(/(519a6075b440153869b155e0|519a6075b320153869b155e0)/);

    // Click the last cell and check navigation
    const gridCells = await page
        .locator(".ui-grid-cell-contents")
    await gridCells.last().click();
    await expect(page).toHaveURL(
      /\/b_enhanced_schema\/(519a6075b440153869b155e0|519a6075b320153869b155e0)\/edit/
    );
  });

  test("should run a standard report", async ({ page }) => {
    await page.goto(
      "http://localhost:9000/#/analyse/g_conditional_field/breakdownbysex"
    );
    await expect(page.locator("h1")).toContainText(
      "Numbers of Applicants By Sex"
    );
    const cells = await page
      .locator(".ui-grid-cell-contents")
      .allTextContents();
    expect(cells).toEqual([
      "Sex  1",
      "No of Applicants  1",
      "Female",
      "11",
      "Male",
      "6",
    ]);
  });
});
