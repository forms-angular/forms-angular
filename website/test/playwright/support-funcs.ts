/*
This file contains a lot of duplicates from the Plait version of it (login for instance)
They need to be kept in sync.
*/

import { expect } from "@playwright/test";

export async function login(page, context, slow = false, username = "sally", password = "8N4b^Ykna@Ys!") {
    if (slow) {
        await page.goto("/login");
        await expect(page.getByText(/Please Login/).first()).toBeVisible();
    }
    const resp = await page.request.post("/auth/local", { form: { username: username, password: password } });
    const token = (await resp.body()).toString();
    await context.addCookies([
        {
            name: "token",
            value: token,
            path: "/",
            domain: "localhost",
        },
    ]);
}

export async function reseed(page) {
    const response = await page.request.delete("/reseed");
    await expect(response).toBeOK();
}