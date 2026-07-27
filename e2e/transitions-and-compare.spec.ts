import { test, expect } from "@playwright/test";

test("view career transitions for a role", async ({ page }) => {
  await page.goto("/transitions?role=software-engineer");
  await expect(page.getByText("Transition map")).toBeVisible();
  await expect(page.getByText("All transitions, ranked by opportunity")).toBeVisible();

  const firstRow = page.locator("table tbody tr").first();
  await expect(firstRow).toBeVisible();
  await firstRow.click();
  await expect(page).toHaveURL(/\/transitions\/software-engineer\//);
  await expect(page.getByText("What to learn next")).toBeVisible();
});

test("compare careers side by side", async ({ page }) => {
  await page.goto("/compare?roles=software-engineer,data-scientist");
  await expect(page.getByRole("heading", { name: "Compare Careers" })).toBeVisible();
  await expect(page.getByText("Overall profile")).toBeVisible();
  await expect(page.locator("table")).toContainText("Median total comp");
});
