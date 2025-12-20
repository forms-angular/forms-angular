/*
This file contains a lot of duplicates from the Plait version of it (login for instance)
They need to be kept in sync.
*/

import { expect } from "@playwright/test";

export async function reseed(page) {
    const response = await page.request.delete("/reseed");
    await expect(response).toBeOK();
}