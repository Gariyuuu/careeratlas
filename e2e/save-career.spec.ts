import { test, expect } from "@playwright/test";

test("sign up, then save a career", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;

  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("E2E Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("testpassword123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  await page.goto("/roles/software-engineer");
  await page.getByRole("button", { name: "Save career" }).click();
  await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();

  await page.goto("/saved");
  await expect(page.getByText("Software Engineer")).toBeVisible();
});
