import { test, expect, type Page } from '@playwright/test';

// An ajax-backed lookup (fng-ui-select with fngAjax) inside an array nested within another array -
// test_nested_select's teams[].members[].deepAjax.
//
// Rendering one of these is not enough on its own: the stored id has to be converted into the
// {id, text} object the control displays, and that conversion has to address the right row through
// both levels of nesting.  Until it did, such a field read and saved its value perfectly well but
// always appeared empty, which is easy to mistake for the value not having been stored.
//
// Read only by design - see the note on adding rows at the foot of this file.
test.describe('Ajax lookup nested two arrays deep', () => {

    const recordUrl = '/#/test_nested_select/54c98b797c627d258d04d66a/edit';

    test.beforeEach(async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: 1024, height: 1468 });
        await page.goto(recordUrl);
    });

    test('displays each row its own stored value', async ({ page }: { page: Page }) => {
        const firstLookup = page.locator('#f_members_deepAjax_0');
        const secondLookup = page.locator('#f_members_deepAjax_1');

        await expect(firstLookup).toBeVisible();
        await expect(secondLookup).toBeVisible();

        // the value is displayed at all (it used to be blank) ...
        await expect(firstLookup.locator('.ui-select-match')).toContainText('IsAccepted John');
        // ... and each row shows its own, rather than repeating its neighbour's
        await expect(secondLookup.locator('.ui-select-match')).toContainText('Jones Alan');

        // the ordinary fields beside them address their own row too
        await expect(page.locator('#f_members_role_0')).toHaveValue('Head of Dept');
        await expect(page.locator('#f_members_role_1')).toHaveValue('Technician');
    });

    test('binds each row to its own model, not an absolute path', async ({ page }: { page: Page }) => {
        // Binding through the row's own ng-repeat variable is what makes the above possible: an
        // absolute "record.teams[$index].members..." path cannot work here, because $index at this
        // depth belongs to the inner repeat and the outer row's index is out of scope.
        await expect(page.locator('#f_members_deepAjax_0')).toHaveAttribute('data-ng-model', 'subDoc2.deepAjax');
        await expect(page.locator('#f_members_deepAjax_1')).toHaveAttribute('data-ng-model', 'subDoc2.deepAjax');
    });

});

// NOTE: adding a row to teams[].members[] through the UI does not work yet, so there is deliberately
// no coverage of it here.  add() pushes the new row correctly, but compiling the fng-ui-select it
// contains registers a conversion, and the $watchCollection on "conversions" in record-handler.ts
// responds by reloading the record from originalData - discarding the row that was just added.
// Worth fixing separately; the watcher exists to re-convert when conversions arrive late, so it
// cannot simply be dropped.
