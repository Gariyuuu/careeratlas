import { test, expect } from "@playwright/test";

test("change education assumptions and see ROI recompute", async ({ page }) => {
  await page.goto("/education/compare");
  await expect(page.getByRole("heading", { name: "Compare Education Paths" })).toBeVisible();

  const netCostBefore = await page.locator("text=Net cost").first().locator("..").innerText();

  const totalCostInput = page.getByLabel("Total cost").first();
  await totalCostInput.fill("150000");
  await totalCostInput.blur();

  const netCostAfter = await page.locator("text=Net cost").first().locator("..").innerText();
  expect(netCostAfter).not.toBe(netCostBefore);
});
