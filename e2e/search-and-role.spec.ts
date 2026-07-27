import { test, expect } from "@playwright/test";

test("search for a role and open its detail page", async ({ page }) => {
  await page.goto("/roles");
  await page.getByPlaceholder("Search roles by title...").fill("Software Engineer");
  await page.waitForURL(/q=Software/);

  const link = page.locator('a[href="/roles/software-engineer"]');
  await expect(link).toBeVisible();
  await link.click();

  await expect(page).toHaveURL(/\/roles\/software-engineer/);
  await expect(page.getByRole("heading", { name: "Software Engineer", level: 1 })).toBeVisible();
  await expect(page.getByText("Compensation by seniority")).toBeVisible();
  await expect(page.getByText("Historical trend & projection")).toBeVisible();
});

test("global search command palette navigates to a role", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /Search roles/i }).click();
  await page.getByPlaceholder("Search roles, titles, or abbreviations...").fill("Data Scientist");
  await page.locator('[cmdk-item][data-value="data-scientist"]').click();
  await expect(page).toHaveURL(/\/roles\/data-scientist/);
});
