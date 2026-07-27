import { test, expect } from "@playwright/test";

test("create and adjust a salary projection", async ({ page }) => {
  await page.goto("/projection?role=software-engineer");
  await expect(page.getByText("Projection for Software Engineer")).toBeVisible();

  const salaryInput = page.getByLabel("Current salary (USD)");
  await expect(salaryInput).toBeVisible();

  const expectedCardBefore = page.locator("text=Expected").first();
  await expect(expectedCardBefore).toBeVisible();

  await salaryInput.fill("200000");
  await salaryInput.blur();

  // Changing the input should update the projected figures instantly (no reload).
  await expect(page.getByText(/\$2\d\dk/).first()).toBeVisible();
});
