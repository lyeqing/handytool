import { expect, test } from "@playwright/test";

test("shows the English sign-in form", async ({ page }) => {
  await page.goto("/en/login");

  await expect(
    page.getByRole("heading", { name: "Your everyday, organised." }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
